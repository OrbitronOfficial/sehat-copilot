"""Document -> structured record -> plain-language explanation.

Stage 1  model reads the document and returns JSON in a fixed schema
Stage 2  code validates it, applies reference ranges, checks medicine names
Stage 3  model writes the explanation around flags the code already decided
"""
import base64
import datetime as dt
import difflib
import json
import os
import re
import uuid

import llm
import ranges

ROOT = os.path.dirname(os.path.abspath(__file__))
DOC_TYPES = ("lab_report", "prescription", "discharge_summary", "diagnostic_report", "other")
MIME_OK = ("image/jpeg", "image/png", "image/webp", "application/pdf", "text/plain")

DISCLAIMER = {
    "en": "This explanation is for understanding your records only. It is not a diagnosis or "
          "medical advice. Do not start, stop or change any medicine without your doctor.",
    "hi": "यह जानकारी केवल आपके रिकॉर्ड को समझने के लिए है। यह कोई निदान या चिकित्सा सलाह नहीं है। "
          "अपने डॉक्टर से पूछे बिना कोई दवा शुरू, बंद या बदलें नहीं।",
}
EMERGENCY = {
    "en": "If this is happening right now, treat it as an emergency: call 108 or go to the "
          "nearest emergency department. ",
    "hi": "अगर यह अभी हो रहा है, तो इसे आपातकाल मानें: 108 पर कॉल करें या नज़दीकी आपातकालीन "
          "विभाग जाएँ। ",
}
_RED_FLAGS = re.compile(
    r"chest pain|can'?t breathe|cannot breathe|breathless|unconscious|faint|seizure|stroke|"
    r"suicid|overdose|bleeding heavily|vomiting blood|सीने में दर्द|सांस नहीं|साँस नहीं|बेहोश|दौरा", re.I)

with open(os.path.join(ROOT, "data", "medicines.json"), encoding="utf-8") as f:
    _MEDS = json.load(f)
_MED_NAMES = {}
for m in _MEDS:
    names = [re.sub(r"\(.*?\)", "", m["generic"] or "")] + m["brands"]
    names += re.findall(r"\((.*?)\)", m["generic"] or "")
    for n in names:
        if n.strip():
            _MED_NAMES[n.strip().lower()] = m

EXTRACT_PROMPT = """You are a medical document reader for Indian healthcare records.
Read the attached document (it may be a photo, scan or PDF; printed or handwritten; English, Hindi or mixed) and return ONE JSON object. Transcribe only what is written. Never guess or fill in a value that you cannot read: use null and lower the confidence.

Schema:
{
 "doc_type": "lab_report" | "prescription" | "discharge_summary" | "diagnostic_report" | "other",
 "title": short title, e.g. "Complete Blood Count" or "Prescription - Dr. Mehta",
 "date": "YYYY-MM-DD" or null (the report / visit / discharge date; Indian documents use DD/MM/YYYY),
 "facility": lab, clinic or hospital name or null,
 "doctor": doctor name or null,
 "patient": {"name": str|null, "age": str|null, "sex": "M"|"F"|null},
 "language_detected": "en" | "hi" | "mixed" | other ISO code,
 "handwritten": true if the clinical content is handwritten,
 "tests": [{"name": test name as printed, "value": number (or string when not numeric, e.g. "Positive"), "unit": str|null, "ref_low": number|null, "ref_high": number|null, "ref_text": the reference range exactly as printed or null, "confidence": 0-1}],
 "medicines": [{"name": brand or drug name as written, "generic": generic name ONLY if it is written, else null, "strength": e.g. "500 mg" or null, "dose": e.g. "1 tablet" or null, "frequency": plain words, e.g. "twice a day (morning and night)", "timing": e.g. "after food" or null, "duration": e.g. "5 days" or null, "instructions": any other instruction or null, "confidence": 0-1}],
 "diagnoses": [{"name": str, "confidence": 0-1}],
 "advice": [short strings: diet, lifestyle, follow-up tests the doctor wrote],
 "follow_up": str|null,
 "overall_confidence": 0-1
}

Rules:
- Expand prescription shorthand into plain words in "frequency": OD = once a day, BD/BID = twice a day, TDS/TID = three times a day, QID = four times a day, HS = at bedtime, SOS = only when needed, 1-0-1 = morning and night, 1-1-1 = morning, afternoon and night, 0-0-1 = night only. AC = before food, PC = after food.
- Translate Hindi instructions into English in the fields, keeping the meaning exact.
- A lab report's "ref_low"/"ref_high" come ONLY from the range printed beside that test. "< 200" means ref_high 200; "> 40" means ref_low 40.
- For discharge summaries, put investigation results in "tests", discharge medicines in "medicines", and final diagnoses in "diagnoses".
- "diagnoses" lists only conditions the document itself states. Do not infer a diagnosis from test values or medicines.
- Confidence reflects how clearly you could read that item: printed and sharp = 0.95+, blurry or handwritten and uncertain = below 0.7.
- If the document is not a health record, return doc_type "other" with empty arrays and overall_confidence 0.
Return JSON only."""

EXPLAIN_PROMPT = """You explain a patient's own medical record to them in {language}, in simple words a 14-year-old could follow. Short sentences. No medical jargon without a plain explanation.

The record below is already extracted and checked. Each test already has a "flag" (low, normal, high, critical, unknown) decided by software from the reference range. You must NOT change a flag, invent a value, or mention anything that is not in the record.

Safety rules:
- Do not diagnose. Say what a value "can be linked to" or "is often checked for", never "you have".
- Do not tell the patient to start, stop or change a medicine or dose.
- For each abnormal test say plainly what the test measures, whether it is above or below the range, and what that commonly means. Keep it calm and factual.
- A "critical" flag: say it needs prompt medical attention.
- Medicines: give the common purpose of each medicine in one line. If you do not recognise it, say so.

Return ONE JSON object:
{{
 "summary": 2-4 sentences: what this document is and the main takeaways,
 "findings": [{{"name": test name exactly as in the record, "flag": the same flag, "meaning": 1-2 sentences}}]  (every test that is not "normal"; if all are normal return one entry that says so with flag "normal"),
 "medicines": [{{"name": medicine name exactly as in the record, "purpose": one line}}],
 "questions": 3-4 useful questions the patient could ask their doctor about this record
}}
All text values must be written in {language}. Keep test and medicine names as they appear.

RECORD:
{record}"""

OVERVIEW_PROMPT = """You are summarising one person's health records for them in {language}, in simple words.
Use only the records below. Flags on tests were decided by software; do not change them. Do not diagnose and do not advise starting, stopping or changing any medicine.

Return ONE JSON object:
{{
 "summary": 3-5 sentences describing the overall picture across time,
 "highlights": up to 5 short points that are going well or have improved (name the test and the values with dates),
 "watch": up to 5 short points still outside the reference range or worth raising with a doctor
}}
All text in {language}.

PATIENT: {patient}
RECORDS (oldest first):
{records}"""

ASK_PROMPT = """You answer a patient's question about their own health records in {language}, in simple words.
Use ONLY the records below. If the records do not contain the answer, say so plainly and suggest asking their doctor. Do not diagnose. Do not advise starting, stopping or changing a medicine or dose. Mention dates and values when you cite a result.

Write the answer as plain text with no markdown (no asterisks, no headings); use short lines.

Return ONE JSON object: {{"answer": str, "sources": [ids of the records you used]}}

RECORDS:
{records}

QUESTION: {question}"""


def _lang_name(lang):
    return "Hindi (Devanagari script, everyday spoken Hindi)" if lang == "hi" else "English"


def _s(v, limit=300):
    if v is None:
        return None
    v = str(v).strip()
    return v[:limit] or None


def _conf(v, default=0.5):
    try:
        return max(0.0, min(1.0, float(v)))
    except (TypeError, ValueError):
        return default


def _date(v):
    v = _s(v)
    if not v:
        return None
    try:
        return dt.date.fromisoformat(v[:10]).isoformat()
    except ValueError:
        m = re.match(r"(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})", v)
        if m:
            try:
                return dt.date(int(m.group(3)), int(m.group(2)), int(m.group(1))).isoformat()
            except ValueError:
                return None
    return None


def match_medicine(name):
    """Returns (known, suggestion). Exact word match is known; a near miss is a suggestion."""
    words = re.sub(r"\b(tab|tablet|cap|capsule|syp|syrup|inj|injection)\b\.?", " ", (name or "").lower())
    words = re.sub(r"[^a-z0-9 ]+", " ", words).split()
    words = [w for w in words if not re.fullmatch(r"\d+(mg|ml|mcg|iu|g)?|mg|ml|mcg|iu", w)]
    if not words:
        return False, None
    for n in (" ".join(words), " ".join(words[:2]), words[0]):
        if n in _MED_NAMES:
            return True, None
    close = difflib.get_close_matches(" ".join(words), list(_MED_NAMES), n=1, cutoff=0.82)
    if not close:
        close = difflib.get_close_matches(words[0], list(_MED_NAMES), n=1, cutoff=0.82)
    return False, (close[0].title() if close else None)


def normalise(raw, source="upload"):
    """Coerce model output into the record schema. Nothing here trusts the model's types."""
    raw = raw if isinstance(raw, dict) else {}
    patient = raw.get("patient") if isinstance(raw.get("patient"), dict) else {}
    rec = {
        "id": "rec_" + uuid.uuid4().hex[:8],
        "doc_type": raw.get("doc_type") if raw.get("doc_type") in DOC_TYPES else "other",
        "title": _s(raw.get("title"), 120) or "Health record",
        "date": _date(raw.get("date")),
        "facility": _s(raw.get("facility"), 160),
        "doctor": _s(raw.get("doctor"), 120),
        "patient": {"name": _s(patient.get("name"), 80), "age": _s(patient.get("age"), 20),
                    "sex": _s(patient.get("sex"), 10)},
        "language_detected": _s(raw.get("language_detected"), 10) or "en",
        "handwritten": bool(raw.get("handwritten")),
        "tests": [], "medicines": [], "diagnoses": [],
        "advice": [_s(a) for a in (raw.get("advice") or []) if _s(a)][:20],
        "follow_up": _s(raw.get("follow_up")),
        "overall_confidence": _conf(raw.get("overall_confidence")),
        "warnings": [], "explanation": {}, "source": source,
    }
    for t in (raw.get("tests") or [])[:120]:
        if not isinstance(t, dict) or not _s(t.get("name")):
            continue
        value = t.get("value")
        num = ranges.to_number(value)
        rec["tests"].append({
            "name": _s(t.get("name"), 100),
            "value": num if num is not None and not isinstance(value, str) else (_s(value, 60) if num is None else num),
            "unit": _s(t.get("unit"), 30) or "",
            "ref_low": ranges.to_number(t.get("ref_low")),
            "ref_high": ranges.to_number(t.get("ref_high")),
            "ref_text": _s(t.get("ref_text"), 80),
            "ref_source": None, "flag": "unknown",
            "confidence": _conf(t.get("confidence")),
        })
    for m in (raw.get("medicines") or [])[:60]:
        if not isinstance(m, dict) or not _s(m.get("name")):
            continue
        rec["medicines"].append({k: _s(m.get(k), 200) for k in
                                 ("name", "generic", "strength", "dose", "frequency", "timing",
                                  "duration", "instructions")}
                                | {"confidence": _conf(m.get("confidence"))})
    for d in (raw.get("diagnoses") or [])[:30]:
        name = _s(d.get("name") if isinstance(d, dict) else d, 160)
        if name:
            rec["diagnoses"].append({"name": name,
                                     "confidence": _conf(d.get("confidence") if isinstance(d, dict) else None, 0.8)})
    return check(rec)


def check(rec):
    """Stage 2. Safe to re-run after the user edits a record."""
    for t in rec.get("tests") or []:
        if t.get("ref_source") == "standard":  # re-derive from the table after an edit
            t["ref_low"] = t["ref_high"] = None
        ranges.flag_test(t)
    warnings = []
    for m in rec.get("medicines") or []:
        known, suggestion = match_medicine(m.get("generic") or m.get("name"))
        if not known and m.get("generic"):
            known, suggestion = match_medicine(m.get("name"))
        m["known"] = known
        if not known and suggestion and _conf(m.get("confidence")) < 0.85:
            warnings.append(f"\"{m.get('name')}\" was hard to read. Did the document say \"{suggestion}\"? Please check.")
    today = dt.date.today().isoformat()
    if not rec.get("date"):
        warnings.append("No date was found on this document. Please add it so it appears in the right place on your timeline.")
    elif rec["date"] > today:
        warnings.append("The date on this document is in the future. Please check it.")
    if rec.get("handwritten"):
        warnings.append("This document is handwritten. Please check every medicine name and dose against the original.")
    low = sum(1 for x in (rec.get("tests") or []) + (rec.get("medicines") or [])
              if _conf(x.get("confidence")) < 0.7)
    if low:
        warnings.append(f"{low} item(s) were read with low confidence and are marked below.")
    if any(t.get("flag") == "critical" for t in rec.get("tests") or []):
        warnings.append("One or more values are far outside the usual range. Please contact your doctor promptly.")
    if rec.get("doc_type") == "other" and not rec.get("tests") and not rec.get("medicines"):
        warnings.append("This does not look like a health record, or it could not be read. Try a sharper photo.")
    rec["warnings"] = warnings
    return rec


class VisionUnavailable(Exception):
    """No vision model could read the file. The page falls back to on-device OCR."""


def extract(filename, mime, data_b64, source="upload", ocr=None):
    """ocr: name of the on-device OCR engine when `data_b64` is its text output."""
    mime = (mime or "").split(";")[0].strip().lower()
    if mime == "image/jpg":
        mime = "image/jpeg"
    if mime not in MIME_OK:
        raise ValueError("Unsupported file type. Upload a photo (JPG/PNG), a PDF or a text file.")
    if mime == "text/plain":
        text = base64.b64decode(data_b64).decode("utf-8", "replace")[:20000]
        if len(text.strip()) < 20:
            raise ValueError("No readable text was found in this document. Try a sharper, well-lit photo.")
        note = ("\n\nThe text below came from OCR and may contain misread characters. "
                "Lower the confidence of anything that looks garbled." if ocr else "")
        raw, provider = llm.write_json(EXTRACT_PROMPT + note + "\n\nDOCUMENT TEXT:\n" + text)
    else:
        try:
            raw, provider = llm.read_document(EXTRACT_PROMPT, {"mime": mime, "data": data_b64})
        except llm.LLMError as e:
            raise VisionUnavailable(str(e)) from e
    rec = normalise(raw, source)
    rec["filename"] = _s(filename, 120)
    rec["extracted_by"] = f"{ocr} + {provider}" if ocr else provider
    if ocr:
        # backup path reads less reliably than the vision model: say so and mark items down
        for item in rec["tests"] + rec["medicines"]:
            item["confidence"] = round(item["confidence"] * 0.85, 2)
        rec["overall_confidence"] = round(rec["overall_confidence"] * 0.85, 2)
        check(rec)
        rec["warnings"].insert(0, "This document was read with the backup on-device reader, which is less "
                                  "accurate. Please compare every value with the original.")
    return rec


def _compact(rec):
    """What the writing model sees: facts and flags, no confidence noise."""
    return {
        "id": rec.get("id"), "type": rec.get("doc_type"), "title": rec.get("title"),
        "date": rec.get("date"), "facility": rec.get("facility"),
        "tests": [{"name": t.get("name"), "value": t.get("value"), "unit": t.get("unit"),
                   "range": t.get("ref_text"), "flag": t.get("flag")} for t in rec.get("tests") or []],
        "medicines": [{k: m.get(k) for k in ("name", "generic", "strength", "dose", "frequency",
                                              "timing", "duration") if m.get(k)}
                      for m in rec.get("medicines") or []],
        "diagnoses": [d.get("name") for d in rec.get("diagnoses") or []],
        "advice": rec.get("advice") or [], "follow_up": rec.get("follow_up"),
    }


def _fallback_explanation(rec, lang):
    """Used when no model is reachable: plain facts from the flags, nothing more."""
    findings = []
    for t in rec.get("tests") or []:
        if t.get("flag") in ("low", "high", "critical"):
            side = {"low": "below", "high": "above", "critical": "far outside"}[t["flag"]]
            findings.append({"name": t["name"], "flag": t["flag"],
                             "meaning": f"{t['name']} is {t.get('value')} {t.get('unit') or ''}, {side} "
                                        f"the reference range ({t.get('ref_text') or 'not printed'})."})
    abnormal = len(findings)
    return {
        "summary": f"{rec.get('title')}: {len(rec.get('tests') or [])} test value(s), {abnormal} outside "
                   f"the reference range, {len(rec.get('medicines') or [])} medicine(s). "
                   "A detailed explanation is unavailable right now.",
        "findings": findings,
        "medicines": [{"name": m["name"], "purpose": (_MED_NAMES.get((m.get("generic") or m["name"]).lower(), {})
                                                      .get("class") or "Ask your doctor or pharmacist.")}
                      for m in rec.get("medicines") or []],
        "questions": ["What do the values outside the range mean for me?",
                      "Do I need any follow-up tests?"],
        "disclaimer": DISCLAIMER.get(lang, DISCLAIMER["en"]), "fallback": True,
    }


def explain(rec, lang="en"):
    lang = "hi" if lang == "hi" else "en"
    flags = {t.get("name"): t.get("flag") for t in rec.get("tests") or []}
    try:
        out, _ = llm.write_json(EXPLAIN_PROMPT.format(
            language=_lang_name(lang), record=json.dumps(_compact(rec), ensure_ascii=False)))
    except llm.LLMError:
        return _fallback_explanation(rec, lang)
    findings = []
    for f in out.get("findings") or []:
        if isinstance(f, dict) and _s(f.get("name")) and _s(f.get("meaning"), 600):
            name = _s(f["name"], 100)
            # the code's flag wins over whatever the model wrote back
            findings.append({"name": name, "flag": flags.get(name, _s(f.get("flag"), 10) or "unknown"),
                             "meaning": _s(f["meaning"], 600)})
    return {
        "summary": _s(out.get("summary"), 1200) or "",
        "findings": findings,
        "medicines": [{"name": _s(m.get("name"), 100), "purpose": _s(m.get("purpose"), 300)}
                      for m in out.get("medicines") or [] if isinstance(m, dict) and _s(m.get("name"))],
        "questions": [_s(q, 300) for q in (out.get("questions") or []) if _s(q)][:5],
        "disclaimer": DISCLAIMER[lang],
    }


def _sorted(records):
    return sorted((r for r in records or [] if isinstance(r, dict)), key=lambda r: r.get("date") or "")


def overview(patient, records, lang="en"):
    lang = "hi" if lang == "hi" else "en"
    if not records:
        return {"summary": "", "highlights": [], "watch": [], "disclaimer": DISCLAIMER[lang]}
    out, _ = llm.write_json(OVERVIEW_PROMPT.format(
        language=_lang_name(lang), patient=json.dumps(patient or {}, ensure_ascii=False),
        records=json.dumps([_compact(r) for r in _sorted(records)[-25:]], ensure_ascii=False)))
    return {"summary": _s(out.get("summary"), 1500) or "",
            "highlights": [_s(x, 300) for x in (out.get("highlights") or []) if _s(x)][:5],
            "watch": [_s(x, 300) for x in (out.get("watch") or []) if _s(x)][:5],
            "disclaimer": DISCLAIMER[lang]}


def ask(question, records, lang="en"):
    lang = "hi" if lang == "hi" else "en"
    question = _s(question, 600)
    if not question:
        raise ValueError("Type a question first.")
    if not records:
        return {"answer": "Add a record first, then ask about it." if lang == "en"
                else "पहले कोई रिकॉर्ड जोड़ें, फिर उसके बारे में पूछें।", "sources": []}
    out, _ = llm.write_json(ASK_PROMPT.format(
        language=_lang_name(lang), question=question,
        records=json.dumps([_compact(r) for r in _sorted(records)[-25:]], ensure_ascii=False)))
    ids = {r.get("id") for r in records if isinstance(r, dict)}
    answer = (_s(out.get("answer"), 2500) or "").replace("**", "")
    if _RED_FLAGS.search(question):
        answer = EMERGENCY[lang] + answer
    return {"answer": answer, "sources": [s for s in (out.get("sources") or []) if s in ids],
            "disclaimer": DISCLAIMER[lang]}

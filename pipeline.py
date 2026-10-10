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
import safety

ROOT = os.path.dirname(os.path.abspath(__file__))
HANDWRITTEN_CAP = 0.6
DOC_TYPES = ("lab_report", "prescription", "discharge_summary", "diagnostic_report", "other")
MIME_OK = ("image/jpeg", "image/png", "image/webp", "application/pdf", "text/plain")

DISCLAIMER = {
    "en": "This explanation is for understanding your records only. It is not a diagnosis or "
          "medical advice. Do not start, stop or change any medicine without your doctor.",
    "hi": "यह जानकारी केवल आपके रिकॉर्ड को समझने के लिए है। यह कोई निदान या चिकित्सा सलाह नहीं है। "
          "अपने डॉक्टर से पूछे बिना कोई दवा शुरू, बंद या बदलें नहीं।",
}
with open(os.path.join(ROOT, "data", "medicines.json"), encoding="utf-8") as f:
    _MEDS = json.load(f)
_MED_NAMES = {}
for m in _MEDS:
    names = [re.sub(r"\(.*?\)", "", m["generic"] or "")] + m["brands"]
    names += re.findall(r"\((.*?)\)", m["generic"] or "")
    for n in names + [m.get("id") or ""]:
        if n.strip():
            _MED_NAMES[n.strip().lower()] = m
            # "Dolo 650" must also match a prescription that says "Dolo" with the strength apart
            bare = " ".join(w for w in n.lower().split() if not w[:1].isdigit())
            if len(bare) > 3:
                _MED_NAMES.setdefault(bare, m)

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
 "tests": [{"name": test name as printed, "value": number (or string when not numeric, e.g. "Positive"), "unit": str|null, "ref_low": number|null, "ref_high": number|null, "ref_text": the reference range exactly as printed or null, "source_text": the whole line this result was read from, copied exactly as printed, "page": page number (1 for a single image), "confidence": 0-1}],
 "medicines": [{"name": brand or drug name as written, "generic": generic name ONLY if it is written, else null, "strength": e.g. "500 mg" or null, "dose": e.g. "1 tablet" or null, "frequency": plain words, e.g. "twice a day (morning and night)", "timing": e.g. "after food" or null, "duration": e.g. "5 days" or null, "instructions": any other instruction or null, "source_text": the whole line this medicine was read from, copied exactly as written (before you expand shorthand), "page": page number, "confidence": 0-1}],
 "diagnoses": [{"name": str, "confidence": 0-1}],
 "advice": [short strings: diet, lifestyle, follow-up tests the doctor wrote],
 "follow_up": str|null,
 "overall_confidence": 0-1,
 "unread": [{"text": the line as best you can read it, "reason": short reason}]
}

Rules:
- Expand prescription shorthand into plain words in "frequency": OD = once a day, BD/BID = twice a day, TDS/TID = three times a day, QID = four times a day, HS = at bedtime, SOS = only when needed, 1-0-1 = morning and night, 1-1-1 = morning, afternoon and night, 0-0-1 = night only. AC = before food, PC = after food. When a line has both a schedule and SOS (for example "1-1-1 SOS"), keep both: "up to three times a day, only when needed". Never drop SOS.
- Translate Hindi instructions into English in the fields, keeping the meaning exact.
- A lab report's "ref_low"/"ref_high" come ONLY from the range printed beside that test. "< 200" means ref_high 200; "> 40" means ref_low 40.
- For discharge summaries, put investigation results in "tests", discharge medicines in "medicines", and final diagnoses in "diagnoses".
- "diagnoses" lists only conditions the document itself states. Do not infer a diagnosis from test values or medicines.
- "unread" lists every line that looks like a result, medicine or diagnosis but that you could not read or parse with confidence (smudged, cut off, garbled digits such as "2l.1", a value with no test name). Put it there and leave it OUT of tests/medicines/diagnoses. Never repair a doubtful value by guessing. Do not list headers, addresses or signatures.
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
- Numbers: write only numbers that appear in the record. Never add a typical range, target or duration as digits; if you need one, write it in words.

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
Use only the records below. Flags on tests were decided by software; do not change them. Compare two results of the same test only when their units match; if they differ, say they cannot be compared directly. Do not diagnose and do not advise starting, stopping or changing any medicine.

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

First decide which kind of answer this is:
- "records": the answer is in the records below. Quote the value, its unit, the reference range and the report date. If part of what they ask is missing from the records, say exactly what is missing.
- "general": the question is about what a test, term or medicine generally is, and the records are not needed. Give a short general explanation and say it is general information, not about them.
- "doctor": the question asks what treatment to take, whether to start, stop or change anything, for a diagnosis, or for a prognosis. Do not answer it. Say this needs their doctor and, if useful, which values from the records to show the doctor.

Rules: compare two results of the same test only when their units match; if the units differ, say they cannot be compared directly. Never diagnose. Never advise starting, stopping or changing a medicine or dose. Never write a number that is not in the records. Plain text only, no markdown (no asterisks, no headings); short lines.

Return ONE JSON object: {{"kind": "records" | "general" | "doctor", "answer": str, "sources": [ids of the records you used, empty unless kind is "records"]}}

RECORDS:
{records}

QUESTION: {question}"""


# Languages the app can write in: (code, English name for the model, native name, right-to-left).
# English and Hindi have hand-written fixed texts. The next eight ship with machine-translated
# interface labels. Every other language is translated on demand (see translate_labels) and
# its explanations and chat answers are written directly in that language by the model.
LANGUAGES = [
    ("en", "English", "English", False), ("hi", "Hindi (Devanagari script, everyday spoken Hindi)", "हिंदी", False),
    ("bn", "Bengali", "বাংলা", False), ("te", "Telugu", "తెలుగు", False), ("mr", "Marathi", "मराठी", False),
    ("ta", "Tamil", "தமிழ்", False), ("gu", "Gujarati", "ગુજરાતી", False), ("kn", "Kannada", "ಕನ್ನಡ", False),
    ("ml", "Malayalam", "മലയാളം", False), ("pa", "Punjabi (Gurmukhi script)", "ਪੰਜਾਬੀ", False),
    ("or", "Odia", "ଓଡ଼ିଆ", False), ("as", "Assamese", "অসমীয়া", False), ("ur", "Urdu", "اردو", True),
    ("ne", "Nepali", "नेपाली", False), ("si", "Sinhala", "සිංහල", False),
    ("es", "Spanish", "Español", False), ("fr", "French", "Français", False), ("de", "German", "Deutsch", False),
    ("pt", "Portuguese", "Português", False), ("it", "Italian", "Italiano", False), ("nl", "Dutch", "Nederlands", False),
    ("ru", "Russian", "Русский", False), ("uk", "Ukrainian", "Українська", False), ("pl", "Polish", "Polski", False),
    ("tr", "Turkish", "Türkçe", False), ("el", "Greek", "Ελληνικά", False), ("sv", "Swedish", "Svenska", False),
    ("ro", "Romanian", "Română", False), ("hu", "Hungarian", "Magyar", False), ("cs", "Czech", "Čeština", False),
    ("ar", "Arabic", "العربية", True), ("fa", "Persian", "فارسی", True), ("he", "Hebrew", "עברית", True),
    ("zh", "Chinese (Simplified)", "中文", False), ("ja", "Japanese", "日本語", False), ("ko", "Korean", "한국어", False),
    ("id", "Indonesian", "Bahasa Indonesia", False), ("ms", "Malay", "Bahasa Melayu", False),
    ("vi", "Vietnamese", "Tiếng Việt", False), ("th", "Thai", "ไทย", False), ("fil", "Filipino", "Filipino", False),
    ("my", "Burmese", "မြန်မာ", False), ("sw", "Swahili", "Kiswahili", False),
]
LANGS = {code: name for code, name, _, _ in LANGUAGES}
BUNDLED = ("en", "hi", "bn", "te", "mr", "ta", "gu", "kn", "ml", "pa")  # label files shipped with the app


def language_list():
    return [{"code": c, "name": n.split(" (")[0], "native": native, "rtl": rtl, "bundled": c in BUNDLED}
            for c, n, native, rtl in LANGUAGES]


def _lang(code):
    return code if code in LANGS else "en"


def _lang_name(lang):
    return LANGS[_lang(lang)] + ("" if lang in ("en", "hi") else " (native script, simple everyday words)")


def _disclaimer(lang):
    if lang in DISCLAIMER:
        return DISCLAIMER[lang]
    short = safety.SHORT["medication"].get(lang)
    return (short + " " if short else "") + DISCLAIMER["en"]


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


def _page(v):
    try:
        return max(1, int(v))
    except (TypeError, ValueError):
        return None


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
        "warnings": [], "unread": [], "explanation": {}, "source": source,
    }
    for t in (raw.get("tests") or [])[:120]:
        if not isinstance(t, dict) or not _s(t.get("name")):
            continue
        value = t.get("value")
        num = ranges.to_number(value)
        inequality = isinstance(value, str) and value.strip()[:1] in ("<", ">")
        rec["tests"].append({
            "name": _s(t.get("name"), 100),
            "value": _s(value, 60) if (num is None or inequality) else num,
            "unit": _s(t.get("unit"), 30) or "",
            "ref_low": ranges.to_number(t.get("ref_low")),
            "ref_high": ranges.to_number(t.get("ref_high")),
            "ref_text": _s(t.get("ref_text"), 80),
            "ref_source": None, "flag": "unknown",
            "source_text": _s(t.get("source_text"), 240), "page": _page(t.get("page")),
            "confidence": _conf(t.get("confidence")),
        })
    for m in (raw.get("medicines") or [])[:60]:
        if not isinstance(m, dict) or not _s(m.get("name")):
            continue
        rec["medicines"].append({k: _s(m.get(k), 200) for k in
                                 ("name", "generic", "strength", "dose", "frequency", "timing",
                                  "duration", "instructions")}
                                | {"source_text": _s(m.get("source_text"), 240), "page": _page(m.get("page")),
                                   "confidence": _conf(m.get("confidence"))})
    for d in (raw.get("diagnoses") or [])[:30]:
        name = _s(d.get("name") if isinstance(d, dict) else d, 160)
        if name:
            rec["diagnoses"].append({"name": name,
                                     "confidence": _conf(d.get("confidence") if isinstance(d, dict) else None, 0.8)})
    if rec["handwritten"]:
        # Handwriting is the hardest case and the costliest to get wrong, so the model's own
        # confidence is not trusted: every item is capped below the "please verify" line.
        for item in rec["tests"] + rec["medicines"] + rec["diagnoses"]:
            item["confidence"] = min(item["confidence"], HANDWRITTEN_CAP)
        rec["overall_confidence"] = min(rec["overall_confidence"], HANDWRITTEN_CAP)
    for u in (raw.get("unread") or [])[:20]:
        text = _s(u.get("text") if isinstance(u, dict) else u, 240)
        if text:
            rec["unread"].append({"text": text,
                                  "reason": _s(u.get("reason") if isinstance(u, dict) else None, 120)})
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
    for t in rec.get("tests") or []:
        if t.get("implausible"):
            t["confidence"] = min(_conf(t.get("confidence")), 0.3)
            warnings.append(f"{t.get('name')}: {t.get('value')} {t.get('unit') or ''} is not a possible value. "
                            "A decimal point was probably missed. Please correct it from the original.")
    today = dt.date.today().isoformat()
    if not rec.get("date"):
        warnings.append("No date was found on this document. Please add it so it appears in the right place on your timeline.")
    elif rec["date"] > today:
        warnings.append("The date on this document is in the future. Please check it.")
    elif rec["date"] < (dt.date.today() - dt.timedelta(days=730)).isoformat():
        # a misread digit in the year is common, especially in handwriting ("2026" read as "2020")
        warnings.append(f"The date was read as {rec['date']}, more than two years ago. If this is a recent "
                        "document, a digit was probably misread. Please check it.")
    if rec.get("handwritten"):
        warnings.append("This document is handwritten. Please check every medicine name and dose against the original.")
    if rec.get("unread"):
        warnings.append(f"{len(rec['unread'])} line(s) could not be read reliably and were left out. "
                        "They are listed under \"Lines not used\"; add them by hand if they matter.")
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


_SIDE = {"en": {"low": "below", "high": "above", "critical": "far outside"},
         "hi": {"low": "से कम", "high": "से अधिक", "critical": "से बहुत बाहर"}}


def _plain_finding(t, lang):
    """One factual sentence built from the checked values. No model involved."""
    value = f"{t.get('value')} {t.get('unit') or ''}".strip()
    rng = t.get("ref_text") or ("छपी नहीं है" if lang == "hi" else "not printed")
    if lang == "hi":
        return f"{t.get('name')}: {value}. यह संदर्भ सीमा ({rng}) {_SIDE['hi'][t['flag']]} है।"
    return f"{t.get('name')} is {value}, {_SIDE['en'][t['flag']]} the reference range ({rng})."


def _plain_summary(rec, lang):
    tests = rec.get("tests") or []
    abnormal = sum(1 for t in tests if t.get("flag") in ("low", "high", "critical"))
    meds = len(rec.get("medicines") or [])
    if lang == "hi":
        return (f"{rec.get('title')}: {len(tests)} जाँच मान, जिनमें से {abnormal} संदर्भ सीमा से बाहर हैं; "
                f"{meds} दवा(एँ)।")
    return (f"{rec.get('title')}: {len(tests)} test value(s), {abnormal} outside the reference range, "
            f"{meds} medicine(s).")


def _fallback_explanation(rec, lang):
    """Used when no model is reachable: plain facts from the flags, nothing more."""
    return {
        "summary": _plain_summary(rec, lang),
        "findings": [{"name": t["name"], "flag": t["flag"], "meaning": _plain_finding(t, lang)}
                     for t in rec.get("tests") or [] if t.get("flag") in ("low", "high", "critical")],
        "medicines": [{"name": m["name"], "purpose": (_MED_NAMES.get((m.get("generic") or m["name"]).lower(), {})
                                                      .get("class") or "Ask your doctor or pharmacist.")}
                      for m in rec.get("medicines") or []],
        "questions": ["What do the values outside the range mean for me?",
                      "Do I need any follow-up tests?"] if lang != "hi" else
                     ["सीमा से बाहर वाले मानों का मेरे लिए क्या मतलब है?", "क्या मुझे कोई और जाँच करानी चाहिए?"],
        "disclaimer": _disclaimer(lang), "fallback": True,
    }


def _verified_numbers(rec):
    """Every number the model is allowed to repeat: what is in the checked record, plus counts."""
    allowed = safety.numbers(json.dumps(_compact(rec), ensure_ascii=False))
    for t in rec.get("tests") or []:
        allowed |= safety.numbers(f"{t.get('ref_low')} {t.get('ref_high')}")
    allowed |= safety.numbers(json.dumps(rec.get("patient") or {}, ensure_ascii=False))
    tests = rec.get("tests") or []
    abnormal = sum(1 for t in tests if t.get("flag") in ("low", "high", "critical"))
    unknown = sum(1 for t in tests if t.get("flag") == "unknown")
    allowed |= {float(n) for n in (len(tests), abnormal, unknown, abnormal + unknown,
                                   len(tests) - abnormal, len(tests) - abnormal - unknown,
                                   len(rec.get("medicines") or []), len(rec.get("diagnoses") or []))}
    return allowed


def explain(rec, lang="en"):
    lang = _lang(lang)
    by_name = {t.get("name"): t for t in rec.get("tests") or []}
    try:
        out, model = llm.write_json(EXPLAIN_PROMPT.format(
            language=_lang_name(lang), record=json.dumps(_compact(rec), ensure_ascii=False)))
    except llm.LLMError:
        return _fallback_explanation(rec, lang)

    # Numeric guard: a number the model wrote that is not in the checked record is treated as
    # invented, and that piece of text is replaced by the plain factual template.
    allowed = _verified_numbers(rec)
    replaced = 0
    findings = []
    for f in out.get("findings") or []:
        if not (isinstance(f, dict) and _s(f.get("name")) and _s(f.get("meaning"), 600)):
            continue
        name = _s(f["name"], 100)
        test = by_name.get(name)
        meaning = _s(f["meaning"], 600)
        # the code's flag wins over whatever the model wrote back
        flag = test.get("flag") if test else (_s(f.get("flag"), 10) or "unknown")
        if safety.unverified(meaning, allowed):
            replaced += 1
            if not (test and flag in _SIDE["en"]):
                continue
            meaning = _plain_finding(test, lang)
        findings.append({"name": name, "flag": flag, "meaning": meaning})

    summary = _s(out.get("summary"), 1200) or ""
    if not summary or safety.unverified(summary, allowed):
        replaced += bool(summary)
        summary = _plain_summary(rec, lang)

    medicines = []
    for m in out.get("medicines") or []:
        if not (isinstance(m, dict) and _s(m.get("name"))):
            continue
        purpose = _s(m.get("purpose"), 300)
        if purpose and safety.unverified(purpose, allowed):
            replaced += 1
            purpose = None
        medicines.append({"name": _s(m["name"], 100), "purpose": purpose})

    questions = [q for q in (_s(q, 300) for q in out.get("questions") or [])
                 if q and not safety.unverified(q, allowed)][:5]
    return {"summary": summary, "findings": findings, "medicines": medicines, "questions": questions,
            "disclaimer": _disclaimer(lang), "guard_replaced": replaced, "model": model, "skipped": list(llm.LAST_SKIPPED)}


def _sorted(records):
    return sorted((r for r in records or [] if isinstance(r, dict)), key=lambda r: r.get("date") or "")


def overview(patient, records, lang="en"):
    lang = _lang(lang)
    if not records:
        return {"summary": "", "highlights": [], "watch": [], "disclaimer": _disclaimer(lang)}
    out, _ = llm.write_json(OVERVIEW_PROMPT.format(
        language=_lang_name(lang), patient=json.dumps(patient or {}, ensure_ascii=False),
        records=json.dumps([_compact(r) for r in _sorted(records)[-25:]], ensure_ascii=False)))
    return {"summary": _s(out.get("summary"), 1500) or "",
            "highlights": [_s(x, 300) for x in (out.get("highlights") or []) if _s(x)][:5],
            "watch": [_s(x, 300) for x in (out.get("watch") or []) if _s(x)][:5],
            "disclaimer": _disclaimer(lang)}


def ask(question, records, lang="en"):
    lang = _lang(lang)
    question = _s(question, 600)
    if not question:
        raise ValueError("Type a question first.")
    gated = safety.gate(question, lang)  # emergency, then medication change: no model call
    if gated:
        return dict(gated, disclaimer=_disclaimer(lang))
    if not records:
        return {"answer": "Add a record first, then ask about it." if lang != "hi"
                else "पहले कोई रिकॉर्ड जोड़ें, फिर उसके बारे में पूछें।", "sources": [], "label": "general"}
    out, _ = llm.write_json(ASK_PROMPT.format(
        language=_lang_name(lang), question=question,
        records=json.dumps([_compact(r) for r in _sorted(records)[-25:]], ensure_ascii=False)))
    ids = {r.get("id") for r in records if isinstance(r, dict)}
    sources = [x for x in (out.get("sources") or []) if x in ids]
    # "From your records" is only shown when the answer really cites a saved record
    if out.get("kind") == "doctor":
        label = "doctor"
    elif sources:
        label = "records"
    else:
        label = "general"
    return {"answer": (_s(out.get("answer"), 2500) or "").replace("**", ""),
            "sources": sources, "label": label, "disclaimer": _disclaimer(lang)}


# ---- interface labels on demand ----

LABELS_PROMPT = """Translate the values of this JSON object from English into {language} for the interface of a health-records app used by ordinary patients.

Rules:
- Return ONE JSON object with exactly the same keys.
- Simple everyday words in the native script. Short labels stay short.
- Keep unchanged: Sehat Copilot, Saathi, ABHA, ABDM, FHIR, PDF, HbA1c, and anything inside curly braces such as {{n}} or {{p}}.
- No notes or explanations.

{chunk}"""


def translate_labels(lang, texts):
    """Translate up to 40 interface labels. A label whose {placeholders} do not survive is dropped."""
    if lang not in LANGS or lang == "en":
        raise ValueError("Unknown language.")
    if not isinstance(texts, dict) or not texts:
        raise ValueError("Nothing to translate.")
    part = {str(k)[:60]: str(v)[:600] for k, v in list(texts.items())[:40] if isinstance(v, str) and v.strip()}
    out, _ = llm.write_json(LABELS_PROMPT.format(language=LANGS[lang], chunk=json.dumps(part, ensure_ascii=False, indent=0)))
    holders = lambda x: sorted(re.findall(r"\{[a-z]+\}", x))
    return {k: out[k].strip() for k, v in part.items()
            if isinstance(out.get(k), str) and out[k].strip() and holders(out[k]) == holders(v)}


# ---- medicine cross-check ----

MEDCHECK_NOTE = {
    "en": "From a small reference list made for this prototype and not reviewed by a pharmacist. It can miss "
          "interactions and can flag ones that do not matter for you. Do not change any medicine because of it; "
          "ask your doctor or pharmacist.",
    "hi": "यह इस प्रोटोटाइप के लिए बनी एक छोटी संदर्भ सूची से है, जिसे किसी फार्मासिस्ट ने जाँचा नहीं है। इसमें कुछ "
          "बातें छूट सकती हैं और कुछ ऐसी भी दिख सकती हैं जो आपके लिए मायने नहीं रखतीं। इसके आधार पर कोई दवा न बदलें; "
          "अपने डॉक्टर या फार्मासिस्ट से पूछें।",
}
_SEVERITY = {"major": 3, "moderate": 2, "minor": 1}


def _find_medicine(name):
    words = re.sub(r"\b(tab|tablet|cap|capsule|syp|syrup|inj|injection)\b\.?", " ", (name or "").lower())
    words = [w for w in re.sub(r"[^a-z0-9 ]+", " ", words).split()
             if not re.fullmatch(r"\d+(mg|ml|mcg|iu|g|k)?|mg|ml|mcg|iu", w)]
    for n in (" ".join(words), " ".join(words[:2]), words[0] if words else ""):
        if n and n in _MED_NAMES:
            return _MED_NAMES[n]
    return None


_INSTRUCTION = re.compile(r"(take|give|use|separate|space|reduce|increase|adjust|monitor|check|consider|switch|"
                          r"dose|needs?|requires?|should|must|prefer|limit|hold|withhold)\b", re.I)


def _neutral(note):
    """Reference notes describe a risk. Any instruction in them ("avoid the combination") is
    dropped: this app never tells anyone to change a medicine."""
    note = _s(note, 300) or ""
    parts = [p.strip() for p in note.split(";") if p.strip()]
    # the first clause states the risk; later clauses that tell the reader what to do are dropped
    keep = parts[:1] + [p for p in parts[1:] if not _INSTRUCTION.match(p)]
    note = "; ".join(keep)
    return re.sub(r"[;,.]?\s*(avoid|do not|don't|stop|must not|never)\b[^.;]*", "", note, flags=re.I).strip(" ;,.-") + "."


def medcheck(medicines, lang="en"):
    """Duplicate ingredients and known interaction pairs among the user's current medicines.
    Pure lookup in data/medicines.json: no model is involved."""
    items, found = [], []
    for m in (medicines or [])[:40]:
        if not isinstance(m, dict) or not _s(m.get("name")):
            continue
        entry = _find_medicine(m.get("generic")) or _find_medicine(m.get("name"))
        name = _s(m.get("name"), 100)
        items.append({"name": name, "ingredient": re.sub(r"\s*\(.*?\)", "", entry["generic"]) if entry else None,
                      "class": entry.get("class") if entry else None, "known": bool(entry)})
        if entry:
            found.append((name, entry))

    by_id = {}
    for name, entry in found:
        by_id.setdefault(entry["id"], []).append(name)
    duplicates = [{"ingredient": re.sub(r"\s*\(.*?\)", "", next(e["generic"] for _, e in found if e["id"] == mid)),
                   "names": sorted(set(names), key=str.lower)}
                  for mid, names in by_id.items() if len({n.lower() for n in names}) > 1]

    pairs = {}
    for name_a, a in found:
        for name_b, b in found:
            if a["id"] == b["id"]:
                continue
            for inter in a.get("interactions") or []:
                if inter["with"] == b["id"] or inter["with"] in (b.get("class_tags") or []):
                    key = tuple(sorted((a["id"], b["id"])))
                    rank = _SEVERITY.get(inter.get("severity"), 1)
                    if key not in pairs or rank > pairs[key][0]:
                        pairs[key] = (rank, {"a": re.sub(r"\s*\(.*?\)", "", a["generic"]),
                                             "b": re.sub(r"\s*\(.*?\)", "", b["generic"]),
                                             "names": [name_a, name_b],
                                             "severity": inter.get("severity") if inter.get("severity") in _SEVERITY else "minor",
                                             "note": _neutral(inter.get("note"))})
    interactions = [v for _, v in sorted(pairs.values(), key=lambda x: -x[0])]
    return {"items": items, "duplicates": duplicates, "interactions": interactions,
            "disclaimer": MEDCHECK_NOTE.get(lang, MEDCHECK_NOTE["en"])}

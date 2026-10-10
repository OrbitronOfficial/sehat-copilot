"""The unified health profile, built in code from the saved records. No model is involved.

What this module decides, and how:
- Conditions      one entry per condition; "(newly detected)" and "(known case)" are the same
                  condition seen twice, so they merge, and every original wording is kept.
- Medicines       a prescription is evidence that a medicine was prescribed, not that it is
                  still taken. Nothing here is ever called "current".
- Tests           names are normalised, counts are converted to one unit, and each result
                  carries the date it was observed, so a trend reads in the right order.
- Attention       only the latest result of each test can need attention; earlier abnormal
                  results stay in the history.
- Questions       built from the record history, each tied to the records it came from.
- Cross checks    a short list of well-known medicine/lab combinations worth raising with a
                  doctor. Wording describes; it never instructs.
"""
import datetime as dt
import re

import pipeline
import ranges

DISCLAIMER = {
    "en": "Built by software from your saved records. It can be incomplete or wrong where a document was "
          "misread. It is not a diagnosis, and nothing here is advice to change a medicine.",
    "hi": "यह आपके सहेजे रिकॉर्ड से सॉफ़्टवेयर ने बनाया है। जहाँ कोई दस्तावेज़ ग़लत पढ़ा गया हो वहाँ यह अधूरा या ग़लत "
          "हो सकता है। यह निदान नहीं है, और यहाँ कुछ भी दवा बदलने की सलाह नहीं है।",
}

_QUALIFIERS = re.compile(
    r"\b(newly|recently|freshly)\s+(detected|diagnosed)\b|\bknown\s+case(\s+of)?\b|\bk/c/o\b|\bh/o\b|"
    r"\bhistory\s+of\b|\bold\s+case\b|\bcase\s+of\b|\bon\s+treatment\b", re.I)
_CONDITION_ALIASES = {
    "t2dm": "type 2 diabetes mellitus", "type ii diabetes mellitus": "type 2 diabetes mellitus",
    "type 2 diabetes": "type 2 diabetes mellitus", "type 2 dm": "type 2 diabetes mellitus",
    "diabetes mellitus type 2": "type 2 diabetes mellitus", "htn": "hypertension",
    "high blood pressure": "hypertension", "dyslipidaemia": "dyslipidemia",
}
_UNIT = {"days": 1, "day": 1, "weeks": 7, "week": 7, "months": 30, "month": 30, "years": 365, "year": 365}


def _strip_parens(text):
    return re.sub(r"\s+", " ", re.sub(r"\(.*?\)", " ", text or "")).strip(" ,;-")


def condition_key(name):
    """Canonical form used only to decide that two mentions are the same condition."""
    k = _QUALIFIERS.sub(" ", _strip_parens(name).lower())
    k = re.sub(r"[^a-z0-9 ]+", " ", k)
    k = re.sub(r"\s+", " ", k).strip()
    return _CONDITION_ALIASES.get(k, k)


def _date(value):
    try:
        return dt.date.fromisoformat(str(value)[:10])
    except (TypeError, ValueError):
        return None


def course_end(date, duration):
    """End date of a course written like "5 days" or "3 months". None when it cannot be told."""
    start = _date(date)
    m = re.search(r"(\d+)\s*(day|days|week|weeks|month|months|year|years)\b", str(duration or "").lower())
    if not start or not m:
        return None
    return start + dt.timedelta(days=int(m.group(1)) * _UNIT[m.group(2)])


def observed_date(test_name, record_date):
    """A discharge summary may print several results of one test: "Platelet Count (05/08, lowest)".
    The date inside the name is when that result was observed; otherwise it is the document date."""
    doc = _date(record_date)
    m = re.search(r"\((?:[^)]*?)(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?", test_name or "")
    if m and doc:
        year = int(m.group(3)) if m.group(3) else doc.year
        year += 2000 if year < 100 else 0
        try:
            seen = dt.date(year, int(m.group(2)), int(m.group(1)))
            if seen <= doc + dt.timedelta(days=1):
                return seen, True
        except ValueError:
            pass
    return doc, False


def _conditions(records):
    out = {}
    for rec in records:
        for d in rec.get("diagnoses") or []:
            text = pipeline._s(d.get("name") if isinstance(d, dict) else d, 160)
            key = condition_key(text) if text else ""
            if not key:
                continue
            entry = out.setdefault(key, {"name": _strip_parens(_QUALIFIERS.sub(" ", text)) or text,
                                         "first_seen": rec.get("date"), "mentions": []})
            entry["mentions"].append({"text": text, "date": rec.get("date"), "record": rec.get("id")})
    return list(out.values())


def _medicines(records, today):
    out = {}
    for rec in records:
        for m in rec.get("medicines") or []:
            name = pipeline._s(m.get("name"), 100)
            if not name:
                continue
            entry = pipeline._find_medicine(m.get("generic")) or pipeline._find_medicine(name)
            key = entry["id"] if entry else re.sub(r"[^a-z0-9]+", " ", name.lower()).strip()
            ends = course_end(rec.get("date"), m.get("duration"))
            item = {k: m.get(k) for k in ("generic", "strength", "dose", "frequency", "timing", "duration")}
            item.update({
                "name": name, "date": rec.get("date"), "record": rec.get("id"),
                "ends": ends.isoformat() if ends else None,
                # never "current": either the written course is over, or we simply do not know
                "status": "course_ended" if ends and ends < today else "unconfirmed",
                "ingredient": re.sub(r"\s*\(.*?\)", "", entry["generic"]) if entry else None,
                "_entry": entry, "mentions": out[key]["mentions"] + 1 if key in out else 1,
            })
            out[key] = item  # records are oldest first, so the latest prescription wins
    return list(out.values())


def _tests(records):
    series = {}
    for rec in records:
        for t in rec.get("tests") or []:
            value = ranges.to_number(t.get("value"))
            if value is None:
                continue
            row = ranges.lookup(t.get("name"))
            key = row[0] if row else _strip_parens(t.get("name")).lower()
            if not key:
                continue
            seen, dated = observed_date(t.get("name"), rec.get("date"))
            std_value, std_unit, note = value, (t.get("unit") or "").strip(), None
            if row and row[0] in ranges._COUNT_SCALE:
                std_value = ranges._scaled(row[0], value, t.get("unit"))
                std_unit = "/cumm"
                if std_value != value:
                    note = f"Converted from {ranges._fmt(value)} {t.get('unit') or ''}".strip()
            if dated:
                note = (note + ". " if note else "") + "Dated from the report line"
            s = series.setdefault(key, {"key": key, "name": row[0] if row else _strip_parens(t.get("name")),
                                        "unit": std_unit, "ref_low": None, "ref_high": None, "points": []})
            s["points"].append({
                "date": seen.isoformat() if seen else None, "value": std_value, "unit": std_unit,
                "orig_value": t.get("value"), "orig_unit": t.get("unit") or "", "orig_name": t.get("name"),
                "flag": t.get("flag") or "unknown", "record": rec.get("id"), "ref_text": t.get("ref_text"),
                "ref_low": _scaled_ref(row, t.get("ref_low"), std_value, value),
                "ref_high": _scaled_ref(row, t.get("ref_high"), std_value, value),
                "comparable": True, "note": note})
    out = []
    for s in series.values():
        s["points"].sort(key=lambda p: p["date"] or "")
        units = [re.sub(r"\s+", "", p["unit"].lower()) for p in s["points"]]
        main = max(set(units), key=units.count)
        for p, u in zip(s["points"], units):
            if u != main:
                p["comparable"] = False
                p["note"] = (p["note"] + ". " if p["note"] else "") + "Reported in a different unit, so not compared"
        usable = [p for p in s["points"] if p["comparable"]]
        s["unit"] = usable[-1]["unit"] if usable else s["unit"]
        s["latest"] = (usable or s["points"])[-1]
        s["ref_low"], s["ref_high"] = s["latest"]["ref_low"], s["latest"]["ref_high"]
        out.append(s)
    return out


def _scaled_ref(row, ref, std_value, value):
    """A count's reference range is converted with the same factor as its value."""
    ref = ranges.to_number(ref)
    if ref is None or not value or std_value == value:
        return ref
    return ref * (std_value / value)


def _attention(tests):
    out = []
    for s in tests:
        p = s["latest"]
        if p["flag"] in ("low", "high", "critical"):
            out.append({"name": s["name"], "value": p["orig_value"], "unit": p["orig_unit"], "flag": p["flag"],
                        "date": p["date"], "record": p["record"], "ref_text": p["ref_text"]})
    order = {"critical": 0, "high": 1, "low": 1}
    return sorted(out, key=lambda a: (order[a["flag"]], a["name"]))


# ---- cross checks: medicine and latest lab value combinations ----

def _latest(tests, name):
    s = next((x for x in tests if x["name"] == name), None)
    return s["latest"] if s else None


def _has(meds, ids=(), tags=(), class_words=()):
    hits = []
    for m in meds:
        e = m.get("_entry")
        if not e or m["status"] == "course_ended":
            continue
        cls = (e.get("class") or "").lower()
        if e["id"] in ids or set(e.get("class_tags") or []) & set(tags) or any(w in cls for w in class_words):
            hits.append(m)
    return hits


def _cross(meds, tests, lang):
    hi = lang == "hi"
    out = []

    def add(title_en, note_en, title_hi, note_hi, used_meds, point):
        records = sorted({m["record"] for m in used_meds} | ({point["record"]} if point else set()))
        out.append({"title": title_hi if hi else title_en, "note": note_hi if hi else note_en, "records": records})

    creat = _latest(tests, "Serum Creatinine")
    potassium = _latest(tests, "Potassium")
    metformin = _has(meds, ids=("metformin",))
    if metformin and creat and creat["value"] > 1.5 and re.sub(r"\s", "", creat["unit"].lower()) == "mg/dl":
        v = f"{ranges._fmt(creat['value'])} mg/dL ({creat['date']})"
        add("Metformin and kidney function",
            f"Your records show metformin ({metformin[0]['name']}) and a creatinine of {v}, which is above the usual "
            "range. Doctors keep an eye on kidney function with this medicine. Worth raising at your next visit.",
            "मेटफ़ॉर्मिन और किडनी की जाँच",
            f"आपके रिकॉर्ड में मेटफ़ॉर्मिन ({metformin[0]['name']}) है और क्रिएटिनिन {v} है, जो सामान्य सीमा से अधिक है। "
            "इस दवा के साथ डॉक्टर किडनी की जाँच पर नज़र रखते हैं। अगली बार डॉक्टर से इस बारे में बात करें।",
            metformin, creat)
    nsaids = _has(meds, tags=("nsaids",))
    if nsaids and creat and creat["flag"] in ("high", "critical"):
        add("Pain medicine and kidney function",
            f"Your records show {nsaids[0]['name']}, a pain medicine of the NSAID type, and a creatinine above the "
            "range. This combination is one doctors like to know about.",
            "दर्द की दवा और किडनी की जाँच",
            f"आपके रिकॉर्ड में {nsaids[0]['name']} (NSAID प्रकार की दर्द की दवा) है और क्रिएटिनिन सीमा से अधिक है। "
            "डॉक्टर को यह साथ में बताना उपयोगी है।", nsaids, creat)
    thinners = _has(meds, tags=("antiplatelets", "anticoagulants"))
    if len({m["_entry"]["id"] for m in thinners}) >= 2:
        names = " and ".join(sorted({m["name"] for m in thinners})[:2])
        add("Two medicines that affect clotting",
            f"Your records show {names}. They are sometimes prescribed together on purpose. It is worth confirming "
            "with your doctor that both are intended.",
            "खून के थक्के पर असर करने वाली दो दवाएँ",
            f"आपके रिकॉर्ड में {names} हैं। कभी-कभी इन्हें जानबूझकर साथ दिया जाता है। डॉक्टर से पुष्टि कर लें कि "
            "दोनों लेनी हैं।", thinners, None)
    raas = _has(meds, class_words=("ace inhibitor", "arb", "angiotensin"), tags=("potassium_sparing",))
    if raas and potassium and potassium["value"] > 5.1:
        v = f"{ranges._fmt(potassium['value'])} {potassium['unit']} ({potassium['date']})"
        add("Blood pressure medicine and potassium",
            f"Your records show {raas[0]['name']} and a potassium of {v}, above the usual range. This type of "
            "medicine can raise potassium, so it is worth mentioning to your doctor.",
            "ब्लड प्रेशर की दवा और पोटैशियम",
            f"आपके रिकॉर्ड में {raas[0]['name']} है और पोटैशियम {v} है, जो सामान्य सीमा से अधिक है। इस तरह की दवा "
            "पोटैशियम बढ़ा सकती है, इसलिए डॉक्टर को बताएँ।", raas, potassium)
    return out


# ---- questions grounded in the record history ----

def _fmt_point(p):
    return f"{ranges._fmt(p['value']) if isinstance(p['value'], (int, float)) else p['value']} {p['unit']}".strip()


def _questions(tests, meds, records, cross, lang):
    hi = lang == "hi"
    out = []

    def add(en, hi_text, recs):
        out.append({"text": hi_text if hi else en, "records": sorted({r for r in recs if r})})

    scored = []
    for s in tests:
        pts = [p for p in s["points"] if p["comparable"] and p["date"]]
        if not pts:
            continue
        first, last = pts[0], pts[-1]
        change = abs(last["value"] - first["value"]) / abs(first["value"]) if len(pts) > 1 and first["value"] else 0
        scored.append((last["flag"] in ("low", "high", "critical"), change, s, first, last, len(pts)))
    for abnormal, change, s, first, last, n in sorted(scored, key=lambda x: (not x[0], -x[1]))[:4]:
        rng = f" ({last['ref_text']})" if last.get("ref_text") else ""
        side_en = {"low": "below", "high": "above", "critical": "far outside"}.get(last["flag"])
        side_hi = {"low": "से कम", "high": "से अधिक", "critical": "से बहुत बाहर"}.get(last["flag"])
        if n > 1 and abnormal and first["value"] != last["value"]:
            add(f"My {s['name']} went from {_fmt_point(first)} on {first['date']} to {_fmt_point(last)} on "
                f"{last['date']}, and it is still {side_en} the range on the report{rng}. What level should I aim "
                "for, and when should it be checked again?",
                f"मेरा {s['name']} {first['date']} को {_fmt_point(first)} था और {last['date']} को {_fmt_point(last)} "
                f"है, जो अब भी रिपोर्ट की सीमा{rng} {side_hi} है। मुझे किस स्तर का लक्ष्य रखना चाहिए, और अगली जाँच कब हो?",
                [first["record"], last["record"]])
        elif abnormal:
            add(f"My {s['name']} was {_fmt_point(last)} on {last['date']}, {side_en} the range on the report{rng}. "
                "What does this mean for me?",
                f"मेरा {s['name']} {last['date']} को {_fmt_point(last)} था, जो रिपोर्ट की सीमा{rng} {side_hi} है। "
                "मेरे लिए इसका क्या मतलब है?", [last["record"]])
        elif n > 1 and change >= 0.15 and first["flag"] in ("low", "high", "critical"):
            add(f"My {s['name']} was {_fmt_point(first)} on {first['date']} and is {_fmt_point(last)} on "
                f"{last['date']}, now within the range. Should anything change in how it is monitored?",
                f"मेरा {s['name']} {first['date']} को {_fmt_point(first)} था और {last['date']} को {_fmt_point(last)} है, "
                "जो अब सीमा के भीतर है। क्या इसकी निगरानी में कुछ बदलना चाहिए?", [first["record"], last["record"]])
    for m in [m for m in meds if m["status"] == "course_ended"][:1]:
        add(f"The {m['name']} course written on {m['date']} ({m['duration']}) looks finished by its dates. "
            "Can you confirm whether I should still be taking it?",
            f"{m['date']} को लिखी {m['name']} ({m['duration']}) की अवधि तारीख़ों के हिसाब से पूरी हो चुकी है। "
            "क्या आप बता सकते हैं कि मुझे यह अब भी लेनी है या नहीं?", [m["record"]])
    for rec in reversed(records):
        if rec.get("follow_up"):
            add(f"My record from {rec.get('date')} says: \"{rec['follow_up']}\" Is this still due?",
                f"{rec.get('date')} के मेरे रिकॉर्ड में लिखा है: \"{rec['follow_up']}\" क्या यह अब भी बाकी है?",
                [rec.get("id")])
            break
    for c in cross[:2]:
        add(f"About \"{c['title']}\": is this something to check in my case?",
            f"\"{c['title']}\" के बारे में: क्या मेरे मामले में इसे जाँचना चाहिए?", c["records"])
    return out[:7]


def build(records, lang="en", today=None):
    lang = lang if lang in DISCLAIMER else "en"
    today = today or dt.date.today()
    records = sorted((r for r in records or [] if isinstance(r, dict)), key=lambda r: r.get("date") or "")
    meds = _medicines(records, today)
    tests = _tests(records)
    cross = _cross(meds, tests, lang)
    questions = _questions(tests, meds, records, cross, lang)
    for m in meds:
        m.pop("_entry", None)
    return {"conditions": _conditions(records), "medicines": meds, "tests": tests,
            "attention": _attention(tests), "questions": questions, "cross": cross,
            "disclaimer": DISCLAIMER[lang]}

"""The unified profile: conditions, medicines, test series, attention list, questions, cross checks.

Uses the five bundled sample records (data/demo.json). No network.
Run: python -m unittest discover tests
"""
import datetime as dt
import json
import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import insights  # noqa: E402
import pipeline  # noqa: E402

with open(os.path.join(ROOT, "data", "demo.json"), encoding="utf-8") as f:
    DEMO = json.load(f)["records"]
TODAY = dt.date(2026, 10, 10)


def lab(rec_id, date, tests, medicines=(), diagnoses=()):
    return pipeline.check({"id": rec_id, "doc_type": "lab_report", "date": date,
                           "tests": [dict(t, confidence=0.95) for t in tests],
                           "medicines": [dict(m, confidence=0.95) for m in medicines],
                           "diagnoses": [{"name": d, "confidence": 0.9} for d in diagnoses]})


class ConditionTests(unittest.TestCase):
    def test_same_condition_seen_twice_is_one_entry_with_both_mentions(self):
        out = insights.build(DEMO, today=TODAY)
        diabetes = [c for c in out["conditions"] if "diabetes" in c["name"].lower()]
        self.assertEqual(len(diabetes), 1)
        self.assertEqual(len(diabetes[0]["mentions"]), 2)
        wording = " ".join(m["text"] for m in diabetes[0]["mentions"])
        self.assertIn("newly detected", wording)   # original wording is kept
        self.assertIn("known case", wording)
        self.assertEqual(diabetes[0]["first_seen"], "2026-03-14")

    def test_different_conditions_are_not_merged(self):
        self.assertNotEqual(insights.condition_key("Type 1 Diabetes Mellitus"),
                            insights.condition_key("Type 2 Diabetes Mellitus (known case)"))
        self.assertEqual(insights.condition_key("T2DM"), insights.condition_key("Type 2 Diabetes Mellitus (newly detected)"))


class MedicineTests(unittest.TestCase):
    def test_nothing_is_called_current(self):
        out = insights.build(DEMO, today=TODAY)
        self.assertTrue(out["medicines"])
        self.assertTrue(all(m["status"] in ("course_ended", "unconfirmed") for m in out["medicines"]))

    def test_short_course_past_its_dates_is_marked_ended(self):
        out = insights.build(DEMO, today=TODAY)
        dolo = next(m for m in out["medicines"] if "dolo" in m["name"].lower())
        self.assertEqual(dolo["status"], "course_ended")     # 5 days from 8 Aug 2026
        self.assertEqual(dolo["ends"], "2026-08-13")
        glycomet = next(m for m in out["medicines"] if "glycomet" in m["name"].lower())
        self.assertEqual(glycomet["status"], "unconfirmed")  # no end date written: we do not know
        self.assertEqual(glycomet["mentions"], 2)
        self.assertEqual(glycomet["date"], "2026-08-08")     # latest prescription, with its source record

    def test_course_end_parsing(self):
        self.assertEqual(insights.course_end("2026-03-14", "8 weeks"), dt.date(2026, 5, 9))
        self.assertIsNone(insights.course_end("2026-03-14", "as advised"))
        self.assertIsNone(insights.course_end(None, "5 days"))


class TestSeriesTests(unittest.TestCase):
    def test_platelet_results_form_one_dated_trend_in_one_unit(self):
        out = insights.build(DEMO, today=TODAY)
        platelets = [s for s in out["tests"] if "platelet" in s["name"].lower()]
        self.assertEqual(len(platelets), 1)
        pts = platelets[0]["points"]
        self.assertEqual([p["date"] for p in pts], ["2026-08-05", "2026-08-08", "2026-09-22"])
        self.assertEqual([p["value"] for p in pts], [68000, 142000, 240000])   # 2.4 lakh converted
        self.assertTrue(all(p["comparable"] and p["unit"] == "/cumm" for p in pts))
        self.assertEqual(pts[2]["orig_value"], 2.4)                             # original is preserved
        self.assertIn("lakh", pts[2]["orig_unit"])
        self.assertIn("Converted", pts[2]["note"])

    def test_observation_date_comes_from_the_report_line_when_printed(self):
        seen, dated = insights.observed_date("Platelet Count (05/08, lowest)", "2026-08-08")
        self.assertEqual((seen, dated), (dt.date(2026, 8, 5), True))
        seen, dated = insights.observed_date("Platelet Count (at discharge)", "2026-08-08")
        self.assertEqual((seen, dated), (dt.date(2026, 8, 8), False))

    def test_incompatible_units_are_kept_apart_with_a_reason(self):
        recs = [lab("a", "2026-01-01", [{"name": "Vitamin D (25-OH)", "value": 20, "unit": "ng/mL"}]),
                lab("b", "2026-02-01", [{"name": "Vitamin D (25-OH)", "value": 22, "unit": "ng/mL"}]),
                lab("c", "2026-03-01", [{"name": "Vitamin D (25-OH)", "value": 60, "unit": "nmol/L"}])]
        series = insights.build(recs, today=TODAY)["tests"][0]
        self.assertEqual([p["comparable"] for p in series["points"]], [True, True, False])
        self.assertIn("different unit", series["points"][2]["note"])
        self.assertEqual(series["latest"]["value"], 22)   # the incomparable result is not "latest"

    def test_only_latest_results_need_attention(self):
        out = insights.build(DEMO, today=TODAY)
        names = [a["name"] for a in out["attention"]]
        self.assertNotIn("Platelet Count", names)                     # low in August, normal in September
        self.assertIn("HbA1c", names)                                 # still above range
        self.assertEqual(len(names), len(set(names)))


class QuestionTests(unittest.TestCase):
    def test_questions_cite_real_values_dates_and_records(self):
        out = insights.build(DEMO, today=TODAY)
        hba1c = next(q for q in out["questions"] if "HbA1c" in q["text"])
        for fact in ("8.4", "6.9", "2026-03-12", "2026-09-22"):
            self.assertIn(fact, hba1c["text"])
        ids = {r["id"] for r in DEMO}
        self.assertTrue(hba1c["records"] and set(hba1c["records"]) <= ids)
        self.assertTrue(all(q["records"] for q in out["questions"]))

    def test_questions_never_tell_the_patient_what_to_do(self):
        for lang in ("en", "hi"):
            for q in insights.build(DEMO, lang, today=TODAY)["questions"]:
                self.assertTrue(q["text"].rstrip().endswith("?"), q["text"])
                self.assertNotRegex(q["text"].lower(), r"\byou should\b|\bstop taking\b|\bstart taking\b")

    def test_hindi_questions_keep_numbers_and_units(self):
        hi = next(q for q in insights.build(DEMO, "hi", today=TODAY)["questions"] if "HbA1c" in q["text"])
        for fact in ("8.4 %", "6.9 %"):
            self.assertIn(fact, hi["text"])


class CrossCheckTests(unittest.TestCase):
    def test_metformin_with_raised_creatinine(self):
        recs = [lab("rx", "2026-09-01", [], medicines=[{"name": "Glycomet", "generic": "Metformin", "strength": "500 mg"}]),
                lab("lab", "2026-09-20", [{"name": "Serum Creatinine", "value": 1.9, "unit": "mg/dL", "ref_low": 0.6, "ref_high": 1.3}])]
        cross = insights.build(recs, today=TODAY)["cross"]
        self.assertEqual(len(cross), 1)
        self.assertIn("1.9", cross[0]["note"])
        self.assertEqual(sorted(cross[0]["records"]), ["lab", "rx"])
        self.assertNotRegex(cross[0]["note"].lower(), r"\bstop\b|\bavoid\b|\bdo not take\b")

    def test_no_flag_when_the_lab_value_is_normal_or_the_course_ended(self):
        normal = [lab("rx", "2026-09-01", [], medicines=[{"name": "Glycomet", "generic": "Metformin"}]),
                  lab("lab", "2026-09-20", [{"name": "Serum Creatinine", "value": 0.9, "unit": "mg/dL", "ref_low": 0.6, "ref_high": 1.3}])]
        self.assertEqual(insights.build(normal, today=TODAY)["cross"], [])
        ended = [lab("rx", "2026-01-01", [], medicines=[{"name": "Ibuprofen", "duration": "5 days"}]),
                 lab("lab", "2026-09-20", [{"name": "Serum Creatinine", "value": 1.9, "unit": "mg/dL", "ref_low": 0.6, "ref_high": 1.3}])]
        self.assertEqual(insights.build(ended, today=TODAY)["cross"], [])

    def test_two_clotting_medicines(self):
        recs = [lab("rx", "2026-09-01", [], medicines=[{"name": "Aspirin"}, {"name": "Clopidogrel"}])]
        cross = insights.build(recs, today=TODAY)["cross"]
        self.assertEqual(len(cross), 1)
        self.assertIn("confirm", cross[0]["note"].lower())

    def test_demo_patient_has_no_cross_flags(self):
        self.assertEqual(insights.build(DEMO, today=TODAY)["cross"], [])


class WellnessTests(unittest.TestCase):
    READINGS = [
        {"id": "v1", "type": "bp", "date": "2026-10-01", "value": 128, "value2": 82},
        {"id": "v2", "type": "bp", "date": "2026-10-08", "value": 152, "value2": 94},
        {"id": "v3", "type": "sugar_fasting", "date": "2026-10-08", "value": 96},
        {"id": "v4", "type": "weight", "date": "2026-10-08", "value": 84},
        {"id": "bad1", "type": "bp", "date": "2026-10-08", "value": 900, "value2": 80},      # impossible
        {"id": "bad2", "type": "mood", "date": "2026-10-08", "value": 5},                    # unknown type
        {"id": "bad3", "type": "pulse", "date": "not a date", "value": 72},
    ]

    def test_flags_are_decided_in_code(self):
        self.assertEqual(insights.vital_flag("bp", 128, 82), "normal")
        self.assertEqual(insights.vital_flag("bp", 152, 94), "high")
        self.assertEqual(insights.vital_flag("bp", 118, 92), "high")       # either number can raise it
        self.assertEqual(insights.vital_flag("bp", 185, 100), "critical")
        self.assertEqual(insights.vital_flag("bp", 86, 55), "low")
        self.assertEqual(insights.vital_flag("sugar_fasting", 96), "normal")
        self.assertEqual(insights.vital_flag("sugar_fasting", 130), "high")
        self.assertEqual(insights.vital_flag("sugar_pp", 130), "normal")
        self.assertEqual(insights.vital_flag("sugar_fasting", 48), "critical")
        self.assertEqual(insights.vital_flag("pulse", 112), "high")
        self.assertEqual(insights.vital_flag("weight", 84), "unknown")     # weight is never flagged

    def test_series_are_dated_and_bad_readings_are_dropped(self):
        out = insights.build([], today=TODAY, vitals=self.READINGS)
        kinds = [s["type"] for s in out["vitals"]]
        self.assertEqual(kinds, ["bp", "sugar_fasting", "weight"])
        bp = out["vitals"][0]
        self.assertEqual([p["text"] for p in bp["points"]], ["128/82", "152/94"])
        self.assertEqual(bp["latest"]["flag"], "high")

    def test_latest_abnormal_reading_needs_attention_and_raises_a_question(self):
        out = insights.build(DEMO, today=TODAY, vitals=self.READINGS)
        home = [a for a in out["attention"] if a.get("source") == "vitals"]
        self.assertEqual([(a["name"], a["value"]) for a in home], [("Blood pressure", "152/94")])
        self.assertTrue(any("152/94" in q["text"] and q["text"].endswith("?") for q in out["questions"]))

    def test_readings_export_as_fhir_vital_signs(self):
        import fhir
        b = fhir.bundle({"name": "Test"}, [], self.READINGS)
        obs = [e["resource"] for e in b["entry"] if e["resource"]["resourceType"] == "Observation"]
        self.assertEqual(len(obs), 4)
        bp = next(o for o in obs if o["code"]["coding"][0]["code"] == "85354-9")
        self.assertEqual([c["valueQuantity"]["value"] for c in bp["component"]], [128, 82])
        self.assertTrue(all(o["category"][0]["coding"][0]["code"] == "vital-signs" for o in obs))


class ShapeTests(unittest.TestCase):
    def test_empty_and_malformed_input(self):
        out = insights.build([], today=TODAY)
        self.assertEqual((out["conditions"], out["medicines"], out["tests"], out["attention"], out["questions"]), ([], [], [], [], []))
        self.assertTrue(insights.build([None, "x", {"id": "r", "tests": [{"name": None, "value": 1}]}], today=TODAY)["disclaimer"])

    def test_output_is_json_serialisable(self):
        json.dumps(insights.build(DEMO, "hi", today=TODAY))


if __name__ == "__main__":
    unittest.main()

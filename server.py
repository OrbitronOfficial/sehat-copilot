"""Sehat Copilot server. Stateless: records live on the user's device, the server only
reads documents, checks values, writes explanations and builds FHIR bundles.

Local:  python server.py   ->  http://localhost:8820
Vercel: api/index.py subclasses Handler.
"""
import json
import mimetypes
import os
import re
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.join(ROOT, "public")
MAX_BODY = 6 * 1024 * 1024


def _load_env():
    path = os.path.join(ROOT, ".env")
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8-sig") as f:
        for line in f:
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.strip().split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())


_load_env()

import fhir  # noqa: E402
import llm  # noqa: E402
import pipeline  # noqa: E402

SAMPLES = [
    {"id": "lab-mar", "title": "Lab report, March 2026", "doc_type": "lab_report", "url": "/samples/lab-2026-03.png"},
    {"id": "rx-mar", "title": "Prescription, March 2026", "doc_type": "prescription", "url": "/samples/prescription-2026-03.png"},
    {"id": "lab-jun", "title": "Lab report, June 2026", "doc_type": "lab_report", "url": "/samples/lab-2026-06.png"},
    {"id": "dis-aug", "title": "Discharge summary, August 2026", "doc_type": "discharge_summary", "url": "/samples/discharge-2026-08.png"},
    {"id": "lab-sep", "title": "Lab report, September 2026", "doc_type": "lab_report", "url": "/samples/lab-2026-09.png"},
]


def _json_file(name, default):
    try:
        with open(os.path.join(ROOT, "data", name), encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return default


def mock_abha(number):
    """Simulated ABDM sandbox: validates the format and returns canned records."""
    digits = re.sub(r"\D", "", str(number or ""))
    if len(digits) != 14:
        raise ValueError("An ABHA number has 14 digits, for example 12-3456-7890-1234.")
    data = _json_file("abha_mock.json", {"name": "Demo User", "records": []})
    records = [pipeline.check(dict(r, source="abha")) for r in data.get("records", [])]
    name = data.get("name") or "Demo User"
    return {"linked": True, "mock": True,
            "abha_number": f"{digits[:2]}-{digits[2:6]}-{digits[6:10]}-{digits[10:]}",
            "abha_address": re.sub(r"[^a-z]", "", name.lower())[:12] + digits[-4:] + "@abdm",
            "name": name, "records": records}


class Handler(BaseHTTPRequestHandler):
    server_version = "SehatCopilot/1.0"

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.command, fmt % args))

    def _send(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _body(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length > MAX_BODY:
            raise ValueError("That file is too large. Please keep uploads under 3 MB.")
        try:
            data = json.loads(self.rfile.read(length) or b"{}")
        except ValueError:
            raise ValueError("Request body must be JSON.")
        if not isinstance(data, dict):
            raise ValueError("Request body must be a JSON object.")
        return data

    def _static(self, path):
        rel = "index.html" if path in ("", "/") else path.lstrip("/")
        full = os.path.normpath(os.path.join(PUBLIC, rel))
        if not full.startswith(PUBLIC) or not os.path.isfile(full):
            return self._send(404, {"error": "Not found"})
        with open(full, "rb") as f:
            body = f.read()
        self.send_response(200)
        self.send_header("Content-Type", mimetypes.guess_type(full)[0] or "application/octet-stream")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/api/health":
            return self._send(200, {"ok": True, "gemini": bool(os.environ.get("GEMINI_API_KEY")),
                                    "groq": bool(os.environ.get("GROQ_API_KEY"))})
        if path == "/api/samples":
            return self._send(200, {"samples": SAMPLES})
        if path == "/api/demo":
            return self._send(200, _json_file("demo.json", {"patient": {}, "records": []}))
        if path.startswith("/api/"):
            return self._send(404, {"error": "Not found"})
        return self._static(path)

    def do_POST(self):
        path = self.path.split("?")[0]
        try:
            b = self._body()
            lang = b.get("lang") or "en"
            if path == "/api/extract":
                if not b.get("data"):
                    raise ValueError("No file was received.")
                out = {"record": _extract(b)}
            elif path == "/api/reflag":
                out = {"record": pipeline.check(_record(b))}
            elif path == "/api/explain":
                out = {"explanation": pipeline.explain(_record(b), lang)}
            elif path == "/api/overview":
                out = {"overview": pipeline.overview(b.get("patient"), b.get("records") or [], lang)}
            elif path == "/api/ask":
                out = pipeline.ask(b.get("question"), b.get("records") or [], lang)
            elif path == "/api/abha":
                out = mock_abha(b.get("abha"))
            elif path == "/api/fhir":
                out = fhir.bundle(b.get("patient"), b.get("records") or [])
            else:
                return self._send(404, {"error": "Not found"})
            return self._send(200, out)
        except ValueError as e:
            return self._send(400, {"error": str(e)})
        except pipeline.VisionUnavailable as e:
            sys.stderr.write(f"Vision unavailable: {e}\n")
            return self._send(503, {"code": "vision_unavailable",
                                    "error": "The AI document reader is busy right now. Please try again in a "
                                             "minute, or upload a photo instead of a PDF."})
        except llm.LLMError as e:
            sys.stderr.write(f"LLM error: {e}\n")
            return self._send(503, {"error": "The AI reader is busy or unreachable right now. Please try again in a moment."})
        except Exception as e:  # never leak a traceback to the page
            sys.stderr.write(f"Server error on {path}: {e!r}\n")
            return self._send(500, {"error": "Something went wrong on our side. Please try again."})


def _extract(b):
    try:
        return pipeline.extract(b.get("filename"), b.get("mime"), b["data"], ocr=b.get("ocr") and "tesseract")
    except pipeline.VisionUnavailable:
        # a bundled sample has a saved reading from an earlier run of this same pipeline
        sample = next((s for s in SAMPLES if s["id"] == b.get("sample_id")), None)
        saved = sample and next((r for r in _json_file("demo.json", {}).get("records", [])
                                 if r.get("file_url") == sample["url"]), None)
        if not saved:
            raise
        rec = pipeline.check(dict(saved, id="rec_" + os.urandom(4).hex(), source="sample"))
        rec["extracted_by"] = f"{saved.get('extracted_by')} (saved reading)"
        rec["warnings"].insert(0, "The live reader is busy, so this sample shows its saved reading.")
        return rec


def _record(body):
    rec = body.get("record")
    if not isinstance(rec, dict):
        raise ValueError("A record is required.")
    return rec


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8820))
    print(f"Sehat Copilot on http://localhost:{port}")
    ThreadingHTTPServer(("", port), Handler).serve_forever()

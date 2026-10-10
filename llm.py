"""Model calls. Every call asks for JSON and returns a parsed dict.

Reading a document (image/PDF) needs a vision model: Gemini.
Writing (explanations, answers, structuring OCR text) goes to Groq first, so the
scarce vision quota is spent only on reading.

Free-tier quotas are per model, so each provider has a chain of models and a
model that reports "quota exhausted" is skipped until its cool-down passes.
"""
import json
import os
import time
import urllib.error
import urllib.request

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GEMINI_MODELS = ("gemini-3.8-flash,gemini-3-flash-preview,gemini-3.5-flash-lite,"
                 "gemini-3.1-flash-lite,gemini-flash-lite-latest,gemini-3.7-flash")
GROQ_MODELS = "openai/gpt-oss-120b,qwen/qwen3.8-27b,openai/gpt-oss-20b"
CALL_TIMEOUT = 28   # one model
BUDGET = 52         # whole request; Vercel cuts the function at 60 s

_resting = {}  # model -> time it may be tried again


class LLMError(Exception):
    pass


class _Http(LLMError):
    def __init__(self, code, detail):
        super().__init__(f"HTTP {code}: {detail[:200]}")
        self.code = code
        self.detail = detail


def _post(url, headers, body, timeout=CALL_TIMEOUT):
    req = urllib.request.Request(
        url, data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "sehat-copilot/1.0", **headers})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise _Http(e.code, e.read().decode("utf-8", "replace")) from e
    except Exception as e:  # timeouts, DNS, bad JSON
        raise LLMError(str(e) or type(e).__name__) from e


def _parse(text):
    text = (text or "").strip()
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end < 0:
        raise LLMError("model did not return JSON")
    try:
        return json.loads(text[start:end + 1])
    except json.JSONDecodeError as e:
        raise LLMError(f"bad JSON from model: {e}") from e


def _chain(env_name, default, call, deadline):
    """Try each model in turn. Returns (json, model). Raises LLMError listing why each failed."""
    errors = []
    for model in [m.strip() for m in os.environ.get(env_name, default).split(",") if m.strip()]:
        left = deadline - time.time()
        if left < 4:
            errors.append("out of time")
            break
        if _resting.get(model, 0) > time.time():
            errors.append(f"{model}: resting (quota)")
            continue
        try:
            return call(model, min(CALL_TIMEOUT, left)), model
        except _Http as e:
            if e.code == 429:
                # a daily cap rests the model for an hour, a per-minute cap for a minute
                _resting[model] = time.time() + (3600 if "PerDay" in e.detail else 60)
            elif e.code in (403, 404):
                _resting[model] = time.time() + 3600
            errors.append(f"{model}: {e}")
        except LLMError as e:
            errors.append(f"{model}: {str(e)[:120]}")
    raise LLMError("; ".join(errors) or "no models configured")


def _gemini(prompt, file, deadline):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise LLMError("GEMINI_API_KEY not set")
    parts = []
    if file:
        parts.append({"inline_data": {"mime_type": file["mime"], "data": file["data"]}})
    parts.append({"text": prompt})
    body = {"contents": [{"parts": parts}],
            "generationConfig": {"temperature": 0, "responseMimeType": "application/json"}}

    def call(model, timeout):
        out = _post(GEMINI_URL.format(model=model), {"x-goog-api-key": key}, body, timeout)
        try:
            return _parse(out["candidates"][0]["content"]["parts"][0]["text"])
        except (KeyError, IndexError) as e:
            raise LLMError("empty response") from e

    return _chain("GEMINI_MODELS", GEMINI_MODELS, call, deadline)


def _groq(prompt, deadline):
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        raise LLMError("GROQ_API_KEY not set")

    def call(model, timeout):
        body = {"model": model, "temperature": 0, "response_format": {"type": "json_object"},
                "messages": [{"role": "user", "content": prompt}]}
        out = _post(GROQ_URL, {"Authorization": f"Bearer {key}"}, body, timeout)
        try:
            return _parse(out["choices"][0]["message"]["content"])
        except (KeyError, IndexError) as e:
            raise LLMError("empty response") from e

    return _chain("GROQ_MODELS", GROQ_MODELS, call, deadline)


def read_document(prompt, file):
    """Vision. Returns (json, model name)."""
    return _gemini(prompt, file, time.time() + BUDGET)


def write_json(prompt):
    """Text only. Groq first, Gemini as backup. Returns (json, model name)."""
    deadline = time.time() + BUDGET
    try:
        return _groq(prompt, deadline)
    except LLMError as first:
        try:
            return _gemini(prompt, None, deadline)
        except LLMError as second:
            raise LLMError(f"groq: {first} | gemini: {second}") from second

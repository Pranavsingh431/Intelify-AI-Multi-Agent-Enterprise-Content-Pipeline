import json
import os
import re

import requests

from services.search import SearchServiceError, search_web

OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "openai/gpt-3.5-turbo"
MAX_EVIDENCE_CONTEXT_CHARS = 1800


class ComplianceServiceError(Exception):
    pass


def _call_openrouter(messages: list[dict[str, str]]) -> str:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ComplianceServiceError("OpenRouter API key is not configured.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {"model": OPENROUTER_MODEL, "messages": messages}

    try:
        response = requests.post(
            OPENROUTER_ENDPOINT,
            headers=headers,
            json=payload,
            timeout=30,
        )
    except requests.RequestException as exc:
        raise ComplianceServiceError("Compliance service is unreachable.") from exc

    if response.status_code >= 400:
        raise ComplianceServiceError("Compliance check failed. Please try again.")

    try:
        data = response.json()
    except ValueError as exc:
        raise ComplianceServiceError("Invalid response from compliance service.") from exc

    choices = data.get("choices", [])
    if not choices:
        raise ComplianceServiceError("Empty response from compliance service.")

    message = choices[0].get("message", {})
    content = message.get("content")
    if not content or not isinstance(content, str):
        raise ComplianceServiceError("Invalid response from compliance service.")

    return content.strip()


def _parse_json_from_text(text: str):
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\[[\s\S]*\]", text)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise ComplianceServiceError("Unable to parse structured compliance output.")


def extract_claims(text: str) -> list[str]:
    prompt = (
        "Extract 5-8 key factual claims from the following text.\n"
        "Return only a JSON array of strings.\n"
        "Do not include explanations.\n\n"
        f"Text:\n{text}"
    )

    raw_output = _call_openrouter([{"role": "user", "content": prompt}])
    parsed = _parse_json_from_text(raw_output)
    if not isinstance(parsed, list):
        raise ComplianceServiceError("Claim extraction output is not a JSON array.")

    claims = [item.strip() for item in parsed if isinstance(item, str) and item.strip()]
    if not claims:
        raise ComplianceServiceError("No factual claims could be extracted.")

    return claims[:8]


def verify_claim(claim: str) -> dict:
    print("---- VERIFYING CLAIM ----")
    print("Claim:", claim)

    try:
        results = search_web(claim)
    except SearchServiceError:
        return {
            "status": "INSUFFICIENT",
            "reason": "Search evidence is unavailable.",
            "evidence": [],
        }

    print("Search Results:", results)
    evidence = ""
    for item in results:
        summary = item.get("summary", "").strip()
        if not summary:
            continue
        evidence += summary[:500] + "\n\n"

    print("EVIDENCE STRING:", evidence)
    if not evidence.strip():
        return {
            "status": "INSUFFICIENT",
            "reason": "No usable evidence found",
            "evidence": results,
        }

    evidence = evidence[:MAX_EVIDENCE_CONTEXT_CHARS]
    prompt = f"""
Given the following claim and supporting web evidence, classify the claim as:

SUPPORTED
UNSUPPORTED
INSUFFICIENT

Claim:
{claim}

Evidence:
{evidence}

Return JSON:
{{
  "status": "...",
  "reason": "short explanation based on evidence"
}}
"""

    print("LLM INPUT CLAIM:", claim)
    print("LLM INPUT EVIDENCE LENGTH:", len(evidence))

    try:
        raw_output = _call_openrouter([{"role": "user", "content": prompt}])
        parsed = _parse_json_from_text(raw_output)
        if not isinstance(parsed, dict):
            raise ComplianceServiceError("Claim verification output is not a JSON object.")

        status = str(parsed.get("status", "")).strip().upper()
        if status not in {"SUPPORTED", "UNSUPPORTED", "INSUFFICIENT"}:
            status = "INSUFFICIENT"

        reason = str(parsed.get("reason", "")).strip()
        if not reason:
            reason = "No explanation returned."

        return {"status": status, "reason": reason, "evidence": results}
    except Exception:
        return {
            "status": "INSUFFICIENT",
            "reason": "Verification failed.",
            "evidence": results,
        }


def run_compliance_check(text: str) -> dict:
    claims = extract_claims(text)
    results = []
    score_total = 0
    score_map = {"SUPPORTED": 1, "INSUFFICIENT": 0, "UNSUPPORTED": -1}

    for claim in claims:
        verdict = verify_claim(claim)
        status = verdict["status"]
        score_total += score_map.get(status, 0)
        results.append(
            {
                "text": claim,
                "status": status,
                "reason": verdict["reason"],
                "evidence": verdict.get("evidence", []),
            }
        )

    claim_count = len(results)
    if claim_count == 0:
        trust_score = 0.0
    else:
        trust_score = (score_total + claim_count) / (2 * claim_count)

    trust_score = max(0.0, min(1.0, round(trust_score, 2)))
    return {"claims": results, "trust_score": trust_score}

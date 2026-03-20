import os

import requests

LANGSEARCH_ENDPOINT = "https://api.langsearch.com/v1/web-search"


class SearchServiceError(Exception):
    pass


def search_web(query: str) -> list[dict]:
    api_key = os.getenv("LANGSEARCH_API_KEY")
    if not api_key:
        raise SearchServiceError("LangSearch API key is not configured.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "query": query,
        "freshness": "noLimit",
        "summary": True,
        "count": 3,
    }
    print("LangSearch Request:", payload)

    try:
        response = requests.post(
            LANGSEARCH_ENDPOINT,
            headers=headers,
            json=payload,
            timeout=20,
        )
    except requests.RequestException as exc:
        raise SearchServiceError("Search service is unreachable.") from exc

    print("Status Code:", response.status_code)
    print("Raw Response:", response.text)
    if response.status_code != 200:
        print("LangSearch Error: Non-200 response received.")
        return []

    try:
        data = response.json()
    except ValueError as exc:
        raise SearchServiceError("Invalid response from search service.") from exc

    raw_results = (
        data.get("data", {}).get("webPages", {}).get("value", [])
        if isinstance(data, dict)
        else []
    )
    if not raw_results:
        print("LangSearch Error: Missing or empty data.webPages.value.")
        return []
    if not isinstance(raw_results, list):
        return []

    normalized = []
    for item in raw_results[:3]:
        if not isinstance(item, dict):
            continue
        title = str(item.get("name", "")).strip()
        url = str(item.get("url", "")).strip()
        summary = str(item.get("summary", item.get("snippet", ""))).strip()
        normalized.append({"title": title, "url": url, "summary": summary})

    return normalized

def transform_content(content: str) -> dict:
    return {
        "linkedin": content[:300],
        "twitter": content[:200],
        "blog": content,
    }

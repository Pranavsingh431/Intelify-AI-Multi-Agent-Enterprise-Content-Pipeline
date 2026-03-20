from fastapi import APIRouter

from services.search import search_web

router = APIRouter()


@router.get("/test-search")
def test_search() -> dict:
    query = "impact of AI in marketing"
    results = search_web(query)

    return {
        "query": query,
        "num_results": len(results),
        "results": results,
    }

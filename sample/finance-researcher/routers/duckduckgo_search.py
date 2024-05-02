from fastapi import APIRouter
from pydantic import BaseModel
from duckduckgo_search import AsyncDDGS

router = APIRouter()

class SearchRequest(BaseModel):
    keywords: str
    timelimit: str = None
    max_results: int = None

@router.post("/duckduckgo_search")
async def search_text(sr: SearchRequest):
    results = await AsyncDDGS().text(sr.keywords, region='us-en', safesearch='off', timelimit=sr.timelimit, max_results=sr.max_results)
    return {"results": results}

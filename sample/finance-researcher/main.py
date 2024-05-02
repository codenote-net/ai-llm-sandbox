from fastapi import FastAPI

app = FastAPI()

from routers import duckduckgo_search

@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(duckduckgo_search.router)

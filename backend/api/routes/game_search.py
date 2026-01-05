from fastapi import APIRouter
from services.igdb_api import IGDBClient
import sys


sys.dont_write_bytecode = True

router = APIRouter()

@router.get("/games/search")
def search_games(q: str = ""):
    if not q.strip():
        return []

    client = IGDBClient()
    games = client._search_games(q)

    return [{"id": g["id"], "name": g["name"], "cover_url": g.get("cover_url")} for g in games]

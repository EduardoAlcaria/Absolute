from services.igdb_api import IGDBClient
from fastapi import APIRouter
import sys

sys.dont_write_bytecode = True

router = APIRouter()

@router.get("/game_info/genres/{game_name}")
def get_game_genres(game_name: str):
    client = IGDBClient()
    game_info = client._search_games(query=game_name)
    return {"game_info": game_info}

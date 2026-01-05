from fastapi import APIRouter
from services.igdb_api import IGDBClient
import sys

sys.dont_write_bytecode = True

router = APIRouter()

@router.get("/games/{game_id}/prices")
def get_game_price(game_id: int):
    return IGDBClient()._get_game_price(game_id)
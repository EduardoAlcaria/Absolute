from services.igdb_api import IGDBClient
from fastapi import APIRouter
import sys

sys.dont_write_bytecode = True

router = APIRouter()

@router.get("/game_img/{game_id}")
def get_game_cover(game_id: int):
    
    client = IGDBClient()
    
    try:
        cover_url = client._get_game_cover(game_id=game_id)
        
        return {"cover_url": cover_url}
    except Exception as e:
        return {"cover_url": None, "error": str(e)}

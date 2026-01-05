from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import sqlite3
import sys

from database.db import get_db
from database.repository import GameRepository, CategoryRepository

sys.dont_write_bytecode = True

router = APIRouter()


class AddGameRequest(BaseModel):
    igdb_id: int
    title: str
    genre: Optional[str] = ""
    image_url: Optional[str] = ""
    status: Optional[str] = "to-play"


class UpdateGameRequest(BaseModel):
    status: Optional[str] = None
    rating: Optional[int] = None


class AddCategoryRequest(BaseModel):
    id: str
    label: str
    color: Optional[str] = "from-gray-600 to-gray-700"


class UpdateCategoryRequest(BaseModel):
    label: str


@router.get("/users/{user_id}/games")
def get_user_games(user_id: int, conn: sqlite3.Connection = Depends(get_db)):
    return GameRepository(conn).get_games(user_id)


@router.post("/users/{user_id}/games", status_code=201)
def add_game(
    user_id: int,
    body: AddGameRequest,
    conn: sqlite3.Connection = Depends(get_db),
):
    return GameRepository(conn).add_game(user_id, body.dict())


@router.patch("/users/{user_id}/games/{game_id}")
def update_game(
    user_id: int,
    game_id: int,
    body: UpdateGameRequest,
    conn: sqlite3.Connection = Depends(get_db),
):
    result = GameRepository(conn).update_game(
        user_id, game_id, body.dict(exclude_none=True)
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return result


@router.delete("/users/{user_id}/games/{game_id}", status_code=204)
def delete_game(
    user_id: int,
    game_id: int,
    conn: sqlite3.Connection = Depends(get_db),
):
    if not GameRepository(conn).delete_game(user_id, game_id):
        raise HTTPException(status_code=404, detail="Game not found")


@router.get("/users/{user_id}/categories")
def get_categories(user_id: int, conn: sqlite3.Connection = Depends(get_db)):
    return CategoryRepository(conn).get_categories(user_id)


@router.post("/users/{user_id}/categories", status_code=201)
def add_category(
    user_id: int,
    body: AddCategoryRequest,
    conn: sqlite3.Connection = Depends(get_db),
):
    return CategoryRepository(conn).add_category(user_id, body.dict())


@router.patch("/users/{user_id}/categories/{cat_id}")
def update_category(
    user_id: int,
    cat_id: str,
    body: UpdateCategoryRequest,
    conn: sqlite3.Connection = Depends(get_db),
):
    if not CategoryRepository(conn).update_category(user_id, cat_id, body.label):
        raise HTTPException(status_code=404, detail="Category not found")
    return {"id": cat_id, "label": body.label}


@router.delete("/users/{user_id}/categories/{cat_id}", status_code=204)
def delete_category(
    user_id: int,
    cat_id: str,
    conn: sqlite3.Connection = Depends(get_db),
):
    if not CategoryRepository(conn).delete_category(user_id, cat_id):
        raise HTTPException(
            status_code=400, detail="Cannot delete default category or category not found"
        )

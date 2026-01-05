from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from api.routes.game_image import router as game_image_router
from api.routes.game_genres import router as game_genres_router
from api.routes.game_search import router as game_search_router
from api.routes.game_details import router as game_details_router
from api.routes.user_games import router as user_games_router
from api.routes.game_prices import router as game_prices_router
from api.routes.image_proxy import router as image_proxy_router



from database.db import init_db

import logging
import sys

sys.dont_write_bytecode = True


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    lifespan=lifespan,
    title="IGDB API",
    description="API to retrieve game data from IGDB",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger("__name__")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Status: {response.status_code}")
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(game_image_router,   tags=["Game Images"])
app.include_router(game_genres_router,  tags=["Game Genres"])
app.include_router(game_search_router,  tags=["Game Search"])
app.include_router(game_details_router, tags=["Game Details"])
app.include_router(game_prices_router, tags=["Game Prices"])
app.include_router(user_games_router,   tags=["User Games"])
app.include_router(image_proxy_router,  tags=["Image Proxy"])



@app.get("/", tags=["Health Check"])
def read_root():

    return {
        "message": "IGDB API is working",
        "version": "2.0.0",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health Check"])
def health_check():

    return {"status": "healthy"}
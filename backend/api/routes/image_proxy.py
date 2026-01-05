import sys
import requests
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

sys.dont_write_bytecode = True

router = APIRouter()

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}


@router.get("/proxy/image")
def proxy_image(url: str = Query(..., description="Full image URL to proxy")):

    try:
        r = requests.get(url, headers=_HEADERS, timeout=10)
        r.raise_for_status()
        content_type = r.headers.get("content-type", "image/jpeg")
        return Response(
            content=r.content,
            media_type=content_type,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=3600",
            },
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch image: {exc}")

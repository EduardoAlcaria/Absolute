import os
import sys


def start(data_dir: str, client_id: str, client_secret: str) -> None:
    os.environ["ANDROID_DATA_DIR"] = data_dir
    os.environ["CLIENT_ID"] = client_id
    os.environ["CLIENT_SECRET"] = client_secret

    sys.dont_write_bytecode = True

    import uvicorn
    from main import app

    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="error")

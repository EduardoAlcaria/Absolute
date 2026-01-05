import os
import sqlite3
import sys
from pathlib import Path

sys.dont_write_bytecode = True

_android_data = os.environ.get("ANDROID_DATA_DIR")
if _android_data:
    DB_PATH = Path(_android_data) / "gametracker.db"
else:
    DB_PATH = Path(__file__).parent.parent / "data" / "gametracker.db"

_SCHEMA = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL DEFAULT 'Player1',
    email    TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS games (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id   INTEGER NOT NULL,
    igdb_id   INTEGER NOT NULL,
    title     TEXT    NOT NULL,
    genre     TEXT    NOT NULL DEFAULT '',
    image_url TEXT    NOT NULL DEFAULT '',
    status    TEXT    NOT NULL DEFAULT 'to-play',
    rating    INTEGER,
    added_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, igdb_id)
);

CREATE TABLE IF NOT EXISTS categories (
    id         TEXT    NOT NULL,
    user_id    INTEGER NOT NULL,
    label      TEXT    NOT NULL,
    color      TEXT    NOT NULL DEFAULT 'from-gray-600 to-gray-700',
    is_default INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (id, user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO users (id, username, email)
    VALUES (1, 'Player1', 'player@example.com');

INSERT OR IGNORE INTO categories (id, user_id, label, color, is_default, sort_order) VALUES
    ('to-play', 1, 'To Play', 'from-gray-600 to-gray-700', 1, 0),
    ('playing',  1, 'Playing', 'from-blue-500 to-blue-600',  1, 1),
    ('beaten',   1, 'Beaten',  'from-green-500 to-green-600', 1, 2);
"""


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(_SCHEMA)
    conn.commit()
    conn.close()


def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
    finally:
        conn.close()

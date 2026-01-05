import sqlite3
import sys

sys.dont_write_bytecode = True


class GameRepository:
    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn

    def get_games(self, user_id: int) -> list[dict]:
        rows = self.conn.execute(
            "SELECT * FROM games WHERE user_id = ? ORDER BY added_at DESC",
            (user_id,)
        ).fetchall()
        return [dict(r) for r in rows]

    def add_game(self, user_id: int, data: dict) -> dict:
        cur = self.conn.execute(
            """
            INSERT INTO games (user_id, igdb_id, title, genre, image_url, status)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, igdb_id) DO UPDATE SET
                title     = excluded.title,
                genre     = CASE WHEN excluded.genre     != '' THEN excluded.genre     ELSE genre     END,
                image_url = CASE WHEN excluded.image_url != '' THEN excluded.image_url ELSE image_url END
            """,
            (
                user_id,
                data["igdb_id"],
                data["title"],
                data.get("genre", ""),
                data.get("image_url", ""),
                data.get("status", "to-play"),
            ),
        )
        self.conn.commit()
        row = self.conn.execute(
            "SELECT * FROM games WHERE rowid = ?", (cur.lastrowid,)
        ).fetchone()
        return dict(row)

    def update_game(self, user_id: int, game_id: int, data: dict) -> dict | None:
        allowed = {k: v for k, v in data.items() if k in ("status", "rating")}
        if not allowed:
            return None
        set_clause = ", ".join(f"{k} = ?" for k in allowed)
        values = list(allowed.values()) + [game_id, user_id]
        self.conn.execute(
            f"UPDATE games SET {set_clause} WHERE id = ? AND user_id = ?",
            values,
        )
        self.conn.commit()
        row = self.conn.execute(
            "SELECT * FROM games WHERE id = ? AND user_id = ?", (game_id, user_id)
        ).fetchone()
        return dict(row) if row else None

    def delete_game(self, user_id: int, game_id: int) -> bool:
        cur = self.conn.execute(
            "DELETE FROM games WHERE id = ? AND user_id = ?", (game_id, user_id)
        )
        self.conn.commit()
        return cur.rowcount > 0


class CategoryRepository:
    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn

    def get_categories(self, user_id: int) -> list[dict]:
        rows = self.conn.execute(
            "SELECT * FROM categories WHERE user_id = ? ORDER BY sort_order ASC",
            (user_id,),
        ).fetchall()
        return [dict(r) for r in rows]

    def add_category(self, user_id: int, data: dict) -> dict:
        max_order = self.conn.execute(
            "SELECT COALESCE(MAX(sort_order), -1) FROM categories WHERE user_id = ?",
            (user_id,),
        ).fetchone()[0]
        self.conn.execute(
            """
            INSERT INTO categories (id, user_id, label, color, is_default, sort_order)
            VALUES (?, ?, ?, ?, 0, ?)
            """,
            (
                data["id"],
                user_id,
                data["label"],
                data.get("color", "from-gray-600 to-gray-700"),
                max_order + 1,
            ),
        )
        self.conn.commit()
        row = self.conn.execute(
            "SELECT * FROM categories WHERE id = ? AND user_id = ?",
            (data["id"], user_id),
        ).fetchone()
        return dict(row)

    def update_category(self, user_id: int, cat_id: str, label: str) -> bool:
        cur = self.conn.execute(
            "UPDATE categories SET label = ? WHERE id = ? AND user_id = ?",
            (label, cat_id, user_id),
        )
        self.conn.commit()
        return cur.rowcount > 0

    def delete_category(self, user_id: int, cat_id: str) -> bool:
        row = self.conn.execute(
            "SELECT is_default FROM categories WHERE id = ? AND user_id = ?",
            (cat_id, user_id),
        ).fetchone()
        if not row or row["is_default"]:
            return False
        self.conn.execute(
            "DELETE FROM categories WHERE id = ? AND user_id = ?", (cat_id, user_id)
        )
        # Reassign affected games back to 'to-play'
        self.conn.execute(
            "UPDATE games SET status = 'to-play' WHERE user_id = ? AND status = ?",
            (user_id, cat_id),
        )
        self.conn.commit()
        return True

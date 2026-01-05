from core.config import get_client_id, get_client_secret
import requests
import time
import sys

sys.dont_write_bytecode = True

_cache: dict = {}
_CACHE_TTL = 300  # 5 minutes

class IGDBClient:

    def __init__(self):
        self.CLIENT_ID = get_client_id()
        self.CLIENT_SECRET = get_client_secret()
        self.BASE_URL = "https://api.igdb.com/v4"
        self.TOKEN_URL = "https://id.twitch.tv/oauth2/token"
        self.token = None
        self.headers = {}

    def _ensure_token(self):
        if not self.token:
            self.token = self._get_token()
            self.headers = {
                'Client-ID': self.CLIENT_ID,
                'Authorization': f'Bearer {self.token}',
            }

    def _get_token(self) -> str:
        response = requests.post(
            self.TOKEN_URL,
            params={
                'client_id': self.CLIENT_ID,
                'client_secret': self.CLIENT_SECRET,
                'grant_type': 'client_credentials'
            },
            timeout=10
        )

        response.raise_for_status()

        return response.json()['access_token']


    def _post(self, endpoint: str, body: str):
        self._ensure_token()
        response = requests.post(
            f"{self.BASE_URL}/{endpoint}",
            headers=self.headers,
            data=body,
            timeout=10
        )

        if response.status_code == 401:
            self.token = None
            self._ensure_token()
            response = requests.post(
                f"{self.BASE_URL}/{endpoint}",
                headers=self.headers,
                data=body,
                timeout=10
            )

        response.raise_for_status()

        return response.json()

    def _search_games(self, query: str, limit: int = 10) -> list:
        cache_key = query.lower().strip()
        now = time.time()
        if cache_key in _cache and now - _cache[cache_key]['ts'] < _CACHE_TTL:
            return _cache[cache_key]['data']

        EXCLUDED = {1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 14}

       
        body1 = f'search "{query}"; fields id, name, total_rating_count, category; limit 50;'

      
        body2 = f'fields id, name, total_rating_count, category; where name ~ *"{query}"* & total_rating_count != null; sort total_rating_count desc; limit 20;'

        results1 = self._post(endpoint="games", body=body1)

        try:
            results2 = self._post(endpoint="games", body=body2)
        except Exception:
            results2 = []

       
        seen = set()
        merged = []

        for g in results2 + results1:
            if g["id"] not in seen:
                seen.add(g["id"])
                if g.get("category", 0) not in EXCLUDED:
                    merged.append(g)

        if not merged:
            return []

        known = [g for g in merged if g.get("total_rating_count", 0) > 10]
        unknown = [g for g in merged if g.get("total_rating_count", 0) <= 10]

        query_lower = query.lower().strip()

        def tier_and_sort(pool):
            exact, starts, word_match, rest = [], [], [], []
            for g in pool:
                name = g["name"].lower()
                words = name.split()
                if name == query_lower:
                    exact.append(g)
                elif name.startswith(query_lower):
                    starts.append(g)
                elif any(w.startswith(query_lower) for w in words):
                    word_match.append(g)
                else:
                    rest.append(g)

            def pop(g):
                return g.get("total_rating_count", 0)

            for t in [exact, starts, word_match, rest]:
                t.sort(key=pop, reverse=True)
            return exact + starts + word_match + rest

        ranked = tier_and_sort(known)
        if len(ranked) < limit:
            ranked += tier_and_sort(unknown)

        top = ranked[:limit]

        if top:
            ids_str = ','.join(str(g['id']) for g in top)
            cover_body = f'fields game, url; where game = ({ids_str}); limit {limit};'
            try:
                covers = self._post(endpoint="covers", body=cover_body)
                cover_map = {
                    c['game']: "https:" + c['url'].replace('t_thumb', 't_cover_big').replace('.jpg', '.png')
                    for c in covers if 'url' in c and 'game' in c
                }
            except Exception:
                cover_map = {}
            for g in top:
                g['cover_url'] = cover_map.get(g['id'])

        _cache[cache_key] = {'data': top, 'ts': now}
        return top

    def _get_game_id(self, game_name: str) -> int:
        body = f'search "{game_name}"; fields id, name; limit 20;'
        games = self._post(endpoint="games", body=body)

        for game in games:
            if game["name"].lower() == game_name.lower():
                return game["id"]
        return games[0]["id"]

    def _get_game_name(self, game_id: int) -> str:
        body = f'fields id, name; where id = {game_id};'
        response = self._post(endpoint="games", body=body)
        return response[0]['name']

    def _get_game_cover(self, game_id: int, size='t_1080p') -> str:
        body = f'fields cover; where id = {game_id};'
        game = self._post(endpoint="games", body=body)

        if not game or 'cover' not in game[0]:
            return ""

        cover_id = game[0]['cover']

        body = f'fields url; where id = {cover_id};'
        cover = self._post(endpoint="covers", body=body)

        return (
            "https:" + cover[0]["url"]
            .replace("t_thumb", size)
            .replace(".jpg", ".png")
        )

    def _get_game_price(self, game_id):
    
        body = f"""
        fields uid, external_game_source, game;
        where game = {game_id} & external_game_source = 1;
        """       
    

        steam_game_id = self._post(endpoint="external_games", body=body)[0]["uid"]
        
        steam_api_url = f"https://store.steampowered.com/api/appdetails?appids={steam_game_id}&cc=br"
        
        try:

            steam_data = requests.get(steam_api_url).json()

            app_data = steam_data.get(str(steam_game_id))

            price_info = app_data["data"].get("price_overview")

            return price_info["final_formatted"]

        except:
            return {"_get_game_price" : "error when trying to fetch steam"}

        

    def _get_game_details(self, game_id: int) -> dict:

        body = (
            f'fields name, summary, '
            f'involved_companies.company.name, involved_companies.developer, involved_companies.publisher, '
            f'external_games.category, external_games.uid, '
            f'platforms.name; '
            f'where id = {game_id};'
        )
        try:
            results = self._post(endpoint="games", body=body)
        except Exception as exc:
            print(f"[igdb] game query failed for {game_id}: {exc}", flush=True)
            return {}

        if not results:
            return {}

        game = results[0]

        developers, publishers = [], []
        for ic in game.get('involved_companies', []):
            company = ic.get('company', {})
            name = company.get('name', '') if isinstance(company, dict) else ''
            if not name:
                continue
            if ic.get('developer'):
                developers.append(name)
            if ic.get('publisher'):
                publishers.append(name)

        platforms = [p['name'] for p in game.get('platforms', []) if 'name' in p]

      
        def secs_to_hours(s):
            return round(s / 3600, 1) if s else None

        time_to_beat = None
        try:
            ttb_results = self._post(
                endpoint="game_time_to_beats",
                body=f'fields normally, hastily, completely; where game_id = {game_id};'
            )
            if ttb_results:
                ttb = ttb_results[0]
                main         = secs_to_hours(ttb.get('normally'))
                rushed       = secs_to_hours(ttb.get('hastily'))
                completionist = secs_to_hours(ttb.get('completely'))
             
                if any(v is not None for v in [main, rushed, completionist]):
                    time_to_beat = {
                        'main': main,
                        'rushed': rushed,
                        'completionist': completionist,
                    }
        except Exception as exc:
            print(f"[igdb] ttb query failed for {game_id}: {exc}", flush=True)

        try:
            steam_price = self._get_game_price(game['id'])
        except Exception:
            steam_price = None

        return {
            'id':           game['id'],
            'name':         game.get('name', ''),
            'summary':      game.get('summary', ''),
            'developers':   developers,
            'publishers':   publishers,
            'time_to_beat': time_to_beat,
            'platforms':    platforms,
            'steam_price':  steam_price,
        }

    def _get_game_genres(self, game_id: int) -> list:
        body = f'fields name, genres; where id = {game_id};'
        response = self._post(endpoint="games", body=body)

        genre_ids = response[0].get('genres', [])
        if not genre_ids:
            return []

        ids_str = ','.join(str(g) for g in genre_ids)
        body = f'fields name; where id = ({ids_str});'
        genres = self._post(endpoint="genres", body=body)
        
        return [g['name'] for g in genres]
# Absolute

A personal gaming tracker for Android. Search your backlog, track progress across custom categories, and share your library.

![Platform](https://img.shields.io/badge/platform-Android-green)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20FastAPI-blue)
![Python](https://img.shields.io/badge/python-3.11%20embedded-yellow)

---

## Features

- Search and add games from the IGDB database
- Organize by statusTo Play, Playing, Beaten
- Custom color-coded categories with banners
- Game details: summary, developer, platforms, time-to-beat, Steam price
- Share card generator (9:16 canvas, save or share)
- Swipe navigation between library, categories, and settings
- Runs fully offline no external server, Python runs inside the APK

---

## Architecture

```
gamingtodolist/
├── backend/Python FastAPI server (IGDB API, SQLite)
└── frontend/ React + Vite app (Capacitor → Android APK)
└── android/Native Android project with embedded Python via Chaquopy
```

The Python backend runs **on-device** via [Chaquopy](https://chaquo.com/chaquopy/), started as a background thread on app launch. The React frontend communicates with it over `http://127.0.0.1:8000`. The SQLite database is stored in Android's private files directory and persists across restarts.

---

## Requirements

| Tool | Version |
|---|---|
| Node.js | 18+ |
| Python | 3.11 |
| Android Studio | Hedgehog+ (for JBR Java 21) |
| Android SDK | API 36 |

---

## Setup

### IGDB Credentials

Sign up at [Twitch Developer Console](https://dev.twitch.tv/console), create an app with the OAuth redirect set to `http://localhost`, and note your **Client ID** and **Client Secret**.

### Backend (desktop / Docker)

```bash
cd backend
cp .env.example .env# add your CLIENT_ID and CLIENT_SECRET
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Or with Docker Compose from the root:

```bash
docker-compose up backend
```

### Frontend (web dev)

```bash
cd frontend
npm install
cp .env.local.example .env.local # add VITE_IGDB_CLIENT_ID / VITE_IGDB_CLIENT_SECRET
npm run dev
```

### Android APK

1. Copy the credentials file:
 ```bash
 cp frontend/android/secrets.gradle.example frontend/android/secrets.gradle
 # edit secrets.gradle and fill in your IGDB credentials
 ```

2. Build and sync:
 ```bash
 cd frontend
 npm run build
 npx cap sync android
 ```

3. Assemble the APK (requires Android Studio's JBR Java 21):
 ```bash
 export JAVA_HOME="/path/to/Android Studio/jbr"
 cd frontend/android
 ./gradlew assembleDebug
 ```

4. Install:
 ```bash
 adb install app/build/outputs/apk/debug/app-debug.apk
 ```

---

## Environment Variables

| File | Key | Purpose |
|---|---|---|
| `backend/.env` | `CLIENT_ID` | Twitch client ID for IGDB |
| `backend/.env` | `CLIENT_SECRET` | Twitch client secret |
| `frontend/.env.local` | `VITE_IGDB_CLIENT_ID` | Same, for web dev mode |
| `frontend/.env.local` | `VITE_IGDB_CLIENT_SECRET` | Same, for web dev mode |
| `frontend/android/secrets.gradle` | `IGDB_CLIENT_ID` | Baked into the APK via BuildConfig |
| `frontend/android/secrets.gradle` | `IGDB_CLIENT_SECRET` | Baked into the APK via BuildConfig |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS |
| Android bridge | Capacitor 8 |
| Native HTTP | CapacitorHttp (bypasses WebView CORS) |
| Python runtime | Chaquopy 15 (Python 3.11 embedded in APK) |
| Backend | FastAPI 0.115, uvicorn, pydantic 1.x |
| Database | SQLite via Python's built-in `sqlite3` |
| Game data | IGDB API v4 (Twitch OAuth) |

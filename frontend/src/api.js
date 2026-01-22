const getApiUrl = () => 'http://127.0.0.1:8000';

const fetchWithTimeout = async (url, options = {}, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

const api = {
  getGames: async (userId) => {
    const res = await fetchWithTimeout(`${getApiUrl()}/users/${userId}/games`);
    return res.ok ? res.json() : [];
  },

  addGame: async (userId, data) => {
    const res = await fetchWithTimeout(`${getApiUrl()}/users/${userId}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok ? res.json() : null;
  },

  deleteGame: async (userId, gameId) => {
    await fetchWithTimeout(`${getApiUrl()}/users/${userId}/games/${gameId}`, { method: 'DELETE' });
  },

  updateGameStatus: async (userId, gameId, status) => {
    const res = await fetchWithTimeout(`${getApiUrl()}/users/${userId}/games/${gameId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.ok ? res.json() : null;
  },

  updateGameRating: async (userId, gameId, rating) => {
    const res = await fetchWithTimeout(`${getApiUrl()}/users/${userId}/games/${gameId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });
    return res.ok ? res.json() : null;
  },

  getGameCovers: async (gameId) => {
    const res = await fetchWithTimeout(`${getApiUrl()}/game_img/${gameId}`);
    return res.ok ? res.json() : null;
  },

  getCategories: async (userId) => {
    const res = await fetchWithTimeout(`${getApiUrl()}/users/${userId}/categories`);
    return res.ok ? res.json() : [];
  },

  addCategory: async (userId, data) => {
    const res = await fetchWithTimeout(`${getApiUrl()}/users/${userId}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok ? res.json() : null;
  },

  updateCategory: async (userId, catId, label) => {
    const res = await fetchWithTimeout(`${getApiUrl()}/users/${userId}/categories/${catId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    });
    return res.ok ? res.json() : null;
  },

  deleteCategory: async (userId, catId) => {
    await fetchWithTimeout(`${getApiUrl()}/users/${userId}/categories/${catId}`, { method: 'DELETE' });
  },
};

export default api;

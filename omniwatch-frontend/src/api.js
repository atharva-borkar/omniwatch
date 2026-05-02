// Centralized API configuration - change VITE_API_URL in .env for production
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...options.headers },
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  // Auth
  login: (username, password) => {
    const body = new URLSearchParams({ username, password });
    return fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || 'Login failed');
      return d;
    });
  },
  register: (username, email, password) =>
    request('/users/', { method: 'POST', body: JSON.stringify({ username, email, password }) }),
  getMe: () => request('/me'),

  // Media
  getMedia: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString();
    return request(`/media/${qs ? '?' + qs : ''}`);
  },
  getMediaById: (id) => request(`/media/${id}`),
  createMedia: (data) => request('/media/', { method: 'POST', body: JSON.stringify(data) }),

  // Watchlist
  getWatchlist: (statusFilter) =>
    request(`/watchlist/${statusFilter ? '?status_filter=' + statusFilter : ''}`),
  addToWatchlist: (mediaId, status = 'plan_to_watch') =>
    request('/watchlist/', { method: 'POST', body: JSON.stringify({ media_id: mediaId, status, progress: 0 }) }),
  updateWatchlistItem: (id, data) =>
    request(`/watchlist/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  removeFromWatchlist: (id) =>
    request(`/watchlist/${id}`, { method: 'DELETE' }),

  // Reviews
  getReviews: (mediaId) => request(`/media/${mediaId}/reviews`),
  createReview: (mediaId, reviewText, rating) =>
    request(`/media/${mediaId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ review_text: reviewText, rating }),
    }),
  deleteReview: (reviewId) => request(`/reviews/${reviewId}`, { method: 'DELETE' }),
};

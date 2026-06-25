// Live client for the admin dashboard's own backend (frontend/backend) —
// handles auth + the Pages CMS. Run it separately:
//   cd frontend/backend && npm run dev   (listens on :5002 by default)
const BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:5002';

const request = async (path, options) => {
  const res = await fetch(`${BASE_URL}/api/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.message || `Request to ${path} failed (${res.status})`);
  }
  return body;
};

export const login = async (username, password) => {
  try {
    const body = await request('auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    return { success: true, user: body.user };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const fetchSitePages = (siteId) => request(`sites/${siteId}/pages`).then((body) => body.data);

export const createPage = (siteId, page) =>
  request(`sites/${siteId}/pages`, { method: 'POST', body: JSON.stringify(page) }).then((body) => body.data);

export const updatePageApi = (pageId, updates) =>
  request(`pages/${pageId}`, { method: 'PUT', body: JSON.stringify(updates) }).then((body) => body.data);

export const deletePageApi = (pageId) => request(`pages/${pageId}`, { method: 'DELETE' });

export const reorderPagesApi = (siteId, orderedIds) =>
  request(`sites/${siteId}/pages/reorder`, { method: 'PUT', body: JSON.stringify({ orderedIds }) });

export const ADMIN_API_BASE_URL = BASE_URL;

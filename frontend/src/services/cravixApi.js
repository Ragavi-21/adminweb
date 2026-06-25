// Live client for the real Cravix backend (d:\admin\Cravix\backend). This is
// a separate project from Dendo with its own API shape (singular route names,
// `mobile` instead of `phone`, etc.) — kept fully independent of dendoApi.js
// so the two never get mixed up.
//   cd Cravix/backend && npm run dev   (listens on :5000 by default)
const BASE_URL = import.meta.env.VITE_CRAVIX_API_URL || 'http://localhost:5000';

const ENDPOINTS = {
  contacts: 'contact',
  drivers: 'driver',
  vendors: 'vendor',
  zoneRequests: 'zone-request',
};

const request = async (path, options) => {
  const res = await fetch(`${BASE_URL}/api/${path}`, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.error || body.message || `Request to ${path} failed (${res.status})`);
  }
  return body.data;
};

export const fetchCravixData = async () => {
  const [contacts, drivers, vendors, zoneRequests] = await Promise.all(
    Object.values(ENDPOINTS).map((path) => request(path))
  );
  return { contacts, drivers, vendors, zoneRequests };
};

export const deleteCravixRecord = (collection, id) =>
  request(`${ENDPOINTS[collection]}/${id}`, { method: 'DELETE' });

export const CRAVIX_API_BASE_URL = BASE_URL;

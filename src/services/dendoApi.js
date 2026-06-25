// Live client for the real Dendo backend (d:\admin\dendo\backend), not the
// in-memory mock used by the other sites. Run that backend separately:
//   cd dendo/backend && npm run dev   (listens on :5000 by default)
const BASE_URL = import.meta.env.VITE_DENDO_API_URL || 'http://localhost:5000';

const ENDPOINTS = {
  zoneRequests: 'zone-requests',
  contactMessages: 'contact-messages',
  driverApplications: 'driver-applications',
  vendorApplications: 'vendor-applications',
};

const request = async (path, options) => {
  const res = await fetch(`${BASE_URL}/api/${path}`, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.message || `Request to ${path} failed (${res.status})`);
  }
  return body.data;
};

export const fetchDendoData = async () => {
  const [zoneRequests, contactMessages, driverApplications, vendorApplications] = await Promise.all(
    Object.values(ENDPOINTS).map((path) => request(path))
  );
  return { zoneRequests, contactMessages, driverApplications, vendorApplications };
};

export const deleteDendoRecord = (collection, id) =>
  request(`${ENDPOINTS[collection]}/${id}`, { method: 'DELETE' });

export const DENDO_API_BASE_URL = BASE_URL;

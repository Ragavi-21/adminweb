const BASE_URL = import.meta.env.VITE_DENDO_REG_API_URL || 'http://localhost:5000';

const request = async (path, options) => {
  const res = await fetch(`${BASE_URL}/api/${path}`, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.message || `Request to ${path} failed (${res.status})`);
  }
  return body.data;
};

export const fetchRegData = async () => {
  const [riderRegistrations, vendorRegistrations] = await Promise.all([
    request('rider-registrations'),
    request('vendor-registrations'),
  ]);
  return { riderRegistrations, vendorRegistrations };
};

export const deleteRegRecord = (collection, id) => {
  const path = collection === 'riderRegistrations' ? 'rider-registrations' : 'vendor-registrations';
  return request(`${path}/${id}`, { method: 'DELETE' });
};

export const DENDO_REG_API_BASE_URL = BASE_URL;

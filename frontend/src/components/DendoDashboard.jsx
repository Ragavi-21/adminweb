import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { fetchDendoData, deleteDendoRecord, DENDO_API_BASE_URL } from '../services/dendoApi';

const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export const DendoDashboard = () => {
  const [data, setData] = useState({ zoneRequests: [], contactMessages: [], driverApplications: [], vendorApplications: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchDendoData());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (collection, id) => {
    if (!window.confirm('Delete this record? This can\'t be undone.')) return;
    try {
      await deleteDendoRecord(collection, id);
      setData((prev) => ({ ...prev, [collection]: prev[collection].filter((r) => r.id !== id) }));
    } catch (err) {
      window.alert(err.message);
    }
  };

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h2 className="section-title" style={{ marginBottom: 4 }}>Dendo Admin Panel</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Live data from the Dendo backend ({DENDO_API_BASE_URL}).</p>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--error-color)', marginBottom: 24, color: 'var(--error-color)' }}>
          Couldn't reach the Dendo backend: {error}
          <div style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 13 }}>
            Make sure it's running: <code>cd dendo/backend && npm run dev</code>
          </div>
        </div>
      )}

      {/* Vendor Applications */}
      <div className="card">
        <h3 className="stat-title" style={{ color: 'var(--text-primary)' }}>Vendor Applications ({data.vendorApplications.length})</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Owner</th>
                <th>Phone</th>
                <th>Shop</th>
                <th>Location</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.vendorApplications.map((v) => (
                <tr key={v.id}>
                  <td>{v.owner_name}</td>
                  <td>{v.phone}</td>
                  <td>{v.shop_name}{v.shop_number ? ` (#${v.shop_number})` : ''}</td>
                  <td>{v.city}, {v.district}, {v.state}</td>
                  <td>{formatDate(v.created_at)}</td>
                  <td><button className="header-icon-btn" onClick={() => handleDelete('vendorApplications', v.id)}><Trash2 size={15} /></button></td>
                </tr>
              ))}
              {data.vendorApplications.length === 0 && !loading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No vendor applications yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver Applications */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 className="stat-title" style={{ color: 'var(--text-primary)' }}>Driver Applications ({data.driverApplications.length})</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Location</th>
                <th>DOB</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.driverApplications.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.phone}</td>
                  <td>{d.area}, {d.district}, {d.state}</td>
                  <td>{formatDate(d.dob)}</td>
                  <td>{formatDate(d.created_at)}</td>
                  <td><button className="header-icon-btn" onClick={() => handleDelete('driverApplications', d.id)}><Trash2 size={15} /></button></td>
                </tr>
              ))}
              {data.driverApplications.length === 0 && !loading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No driver applications yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zone Requests */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 className="stat-title" style={{ color: 'var(--text-primary)' }}>Zone Requests ({data.zoneRequests.length})</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Message</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.zoneRequests.map((z) => (
                <tr key={z.id}>
                  <td>{z.area}, {z.district}, {z.state}</td>
                  <td>{z.message || '—'}</td>
                  <td>{formatDate(z.created_at)}</td>
                  <td><button className="header-icon-btn" onClick={() => handleDelete('zoneRequests', z.id)}><Trash2 size={15} /></button></td>
                </tr>
              ))}
              {data.zoneRequests.length === 0 && !loading && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No zone requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Messages */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 className="stat-title" style={{ color: 'var(--text-primary)' }}>Contact Messages ({data.contactMessages.length})</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Query Type</th>
                <th>Message</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.contactMessages.map((c) => (
                <tr key={c.id}>
                  <td>{c.first_name}</td>
                  <td>{c.email}<br />{c.mobile_number}</td>
                  <td><span className="badge badge-info">{c.query_type}</span></td>
                  <td>{c.message}</td>
                  <td>{formatDate(c.created_at)}</td>
                  <td><button className="header-icon-btn" onClick={() => handleDelete('contactMessages', c.id)}><Trash2 size={15} /></button></td>
                </tr>
              ))}
              {data.contactMessages.length === 0 && !loading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No contact messages yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

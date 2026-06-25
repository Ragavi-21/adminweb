import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { RefreshCw, Trash2, Check, X, Search, ClipboardCheck, FileText } from 'lucide-react';
import { fetchRegData, deleteRegRecord, DENDO_REG_API_BASE_URL } from '../services/dendoRegApi';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
};

const formatDateShort = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const STATUS_META = {
  new:      { label: 'New',      badge: 'badge-warning' },
  approved: { label: 'Approved', badge: 'badge-success' },
  rejected: { label: 'Rejected', badge: 'badge-error'   },
};

const FileLinks = ({ paths, label }) => {
  if (!paths || paths.length === 0) return <span style={{ color: 'var(--text-secondary)' }}>—</span>;
  const list = Array.isArray(paths) ? paths : [paths];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {list.map((p, i) => (
        <a
          key={i}
          href={`${DENDO_REG_API_BASE_URL}/uploads/${p.replace(/^.*[\\/]/, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-color)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <FileText size={11} /> {label}{list.length > 1 ? ` ${i + 1}` : ''}
        </a>
      ))}
    </div>
  );
};

export const DendoReg = () => {
  const [tab, setTab] = useState('riders');
  const [riders, setRiders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRegData();
      setRiders(data.riderRegistrations);
      setVendors(data.vendorRegistrations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getStatus = (id) => statuses[id] || 'new';
  const toggleStatus = (id, next) =>
    setStatuses(prev => ({ ...prev, [id]: prev[id] === next ? 'new' : next }));

  const handleDelete = async (collection, id) => {
    if (!window.confirm('Delete this registration? This cannot be undone.')) return;
    try {
      await deleteRegRecord(collection, id);
      if (collection === 'riderRegistrations') {
        setRiders(prev => prev.filter(r => r.id !== id));
      } else {
        setVendors(prev => prev.filter(v => v.id !== id));
      }
      setStatuses(prev => { const n = { ...prev }; delete n[id]; return n; });
    } catch (err) {
      window.alert(err.message);
    }
  };

  const handleTabChange = (t) => { setTab(t); setSearch(''); };

  const activeList = tab === 'riders' ? riders : vendors;
  const countBy = (s) => activeList.filter(r => getStatus(r.id) === s).length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return activeList;
    return activeList.filter(r => {
      const text = tab === 'riders'
        ? `${r.first_name} ${r.last_name} ${r.mobile_number} ${r.email} ${r.city} ${r.state} ${r.vehicle_type}`.toLowerCase()
        : `${r.shop_name} ${r.owner_name} ${r.owner_mobile} ${r.city} ${r.state} ${r.fssai_number}`.toLowerCase();
      return text.includes(q);
    });
  }, [activeList, search, tab]);

  const stats = [
    { label: 'Total',    value: activeList.length,   color: 'var(--accent-color)' },
    { label: 'New',      value: countBy('new'),       color: '#f59e0b' },
    { label: 'Approved', value: countBy('approved'),  color: '#10b981' },
    { label: 'Rejected', value: countBy('rejected'),  color: '#ef4444' },
  ];

  return (
    <section>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, hsl(270,85%,60%), hsl(220,85%,60%))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ClipboardCheck size={20} color="#fff" />
          </div>
          <div>
            <h2 className="section-title" style={{ marginBottom: 2 }}>Dendo Registrations</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
              Live data · {DENDO_REG_API_BASE_URL}
            </p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--error-color)', marginBottom: 20, color: 'var(--error-color)' }}>
          <strong>Backend unreachable:</strong> {error}
          <div style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 12 }}>
            Start it with: <code>cd dendoreg/backend &amp;&amp; npm run dev</code>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="dendo-reg-stats">
        {stats.map(s => (
          <div key={s.label} className="card dendo-reg-stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
            <div className="dendo-reg-stat-label">{s.label}</div>
            <div className="dendo-reg-stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="dendo-reg-toolbar">
        <div className="site-subnav" style={{ marginBottom: 0 }}>
          <button
            className={`pages-tab ${tab === 'riders' ? 'active' : ''}`}
            onClick={() => handleTabChange('riders')}
          >
            Rider Registrations
            <span className="dendo-reg-count">{riders.length}</span>
          </button>
          <button
            className={`pages-tab ${tab === 'vendors' ? 'active' : ''}`}
            onClick={() => handleTabChange('vendors')}
          >
            Vendor Registrations
            <span className="dendo-reg-count">{vendors.length}</span>
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-secondary)',
          }} />
          <input
            className="header-search"
            style={{ paddingLeft: 30, width: 210 }}
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ marginTop: 0 }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              {tab === 'riders' ? (
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Gender</th>
                  <th>Vehicle</th>
                  <th>Location</th>
                  <th>License No.</th>
                  <th>Documents</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              ) : (
                <tr>
                  <th>#</th>
                  <th>Shop Name</th>
                  <th>Owner</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>Hours</th>
                  <th>FSSAI No.</th>
                  <th>Files</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              )}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                    <RefreshCw size={18} className="spin" style={{ display: 'inline-block', marginRight: 8 }} />
                    Loading registrations…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                    {search
                      ? `No results for "${search}"`
                      : `No ${tab === 'riders' ? 'rider' : 'vendor'} registrations yet.`}
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => {
                  const status = getStatus(r.id);
                  const { label, badge } = STATUS_META[status];
                  const collection = tab === 'riders' ? 'riderRegistrations' : 'vendorRegistrations';
                  return (
                    <tr key={r.id}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{i + 1}</td>
                      {tab === 'riders' ? (
                        <>
                          <td>
                            <strong>{r.first_name} {r.last_name}</strong>
                            {r.profile_picture_path && (
                              <a
                                href={`${DENDO_REG_API_BASE_URL}/uploads/${r.profile_picture_path.replace(/^.*[\\/]/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'block', color: 'var(--accent-color)', fontSize: 11 }}
                              >
                                View photo
                              </a>
                            )}
                          </td>
                          <td>
                            <div>{r.mobile_number}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{r.email}</div>
                          </td>
                          <td>{r.gender}</td>
                          <td><span className="badge badge-info">{r.vehicle_type}</span></td>
                          <td>{r.city}, {r.state}</td>
                          <td style={{ fontSize: 12 }}>{r.driving_license_number}</td>
                          <td>
                            <FileLinks paths={r.id_proof_file_path} label={r.id_proof_type} />
                            <FileLinks paths={r.driving_license_file_path} label="License" />
                          </td>
                        </>
                      ) : (
                        <>
                          <td><strong>{r.shop_name}</strong></td>
                          <td>{r.owner_name}</td>
                          <td>
                            <div>{r.owner_mobile}</div>
                            {r.shop_mobile && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{r.shop_mobile}</div>}
                          </td>
                          <td>{r.city}, {r.state}</td>
                          <td style={{ fontSize: 12 }}>
                            <div>{r.opening_time} – {r.closing_time}</div>
                            <div style={{ color: 'var(--text-secondary)' }}>{r.delivery_time} delivery</div>
                          </td>
                          <td style={{ fontSize: 12 }}>
                            <div>{r.fssai_number}</div>
                            <div style={{ color: 'var(--text-secondary)' }}>Exp: {formatDateShort(r.fssai_expiry_date)}</div>
                          </td>
                          <td>
                            <FileLinks paths={r.fssai_certificate_path} label="FSSAI Cert" />
                            <FileLinks paths={r.menu_file_paths} label="Menu" />
                          </td>
                        </>
                      )}
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDate(r.created_at)}</td>
                      <td><span className={`badge ${badge}`}>{label}</span></td>
                      <td>
                        <div className="dendo-reg-actions">
                          <button
                            className="header-icon-btn dendo-reg-approve"
                            title="Approve"
                            data-active={status === 'approved'}
                            onClick={() => toggleStatus(r.id, 'approved')}
                          >
                            <Check size={14} />
                          </button>
                          <button
                            className="header-icon-btn dendo-reg-reject"
                            title="Reject"
                            data-active={status === 'rejected'}
                            onClick={() => toggleStatus(r.id, 'rejected')}
                          >
                            <X size={14} />
                          </button>
                          <button
                            className="header-icon-btn"
                            title="Delete record"
                            onClick={() => handleDelete(collection, r.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)' }}>
            Showing {filtered.length} of {activeList.length} {tab === 'riders' ? 'rider' : 'vendor'} registrations
            {search && ` · filtered by "${search}"`}
          </div>
        )}
      </div>
    </section>
  );
};

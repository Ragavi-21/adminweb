import React, { useMemo, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  Search,
  Filter,
  GripVertical,
  FileText,
  LayoutTemplate,
  List,
  Copy,
  ShieldAlert,
  Eye,
  Pencil,
  MoreVertical,
  Plus,
  ExternalLink,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const TYPE_ICON = {
  Landing: LayoutTemplate,
  Page: FileText,
  Listing: List,
  Single: Copy,
  System: ShieldAlert,
};

const TABS = ['All Pages', 'Landing Pages', 'System Pages'];

const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const slugify = (text) =>
  '/' + text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const AddPageModal = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState('Page');
  const [slugTouched, setSlugTouched] = useState(false);

  const handleTitleChange = (value) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title: title.trim(), slug: slug || '/', type });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add New Page</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Page Title</label>
            <input
              className="input-field"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Careers"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Page Slug</label>
            <input
              className="input-field"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="/careers"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Page Type</label>
            <select className="select-field input-field" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Page">Page</option>
              <option value="Landing">Landing</option>
              <option value="Listing">Listing</option>
              <option value="Single">Single</option>
              <option value="System">System</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Create Page
          </button>
        </form>
      </div>
    </div>
  );
};

export const PagesManager = ({ siteId }) => {
  const { data, addPage, updatePage, deletePage, reorderPages } = useDashboard();
  const site = data.sites[siteId];
  const pages = site?.pages || [];

  const [activeTab, setActiveTab] = useState('All Pages');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id ?? null);
  const [detailTab, setDetailTab] = useState('Content');
  const [showAddModal, setShowAddModal] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dragId, setDragId] = useState(null);

  const filteredPages = useMemo(() => {
    return pages.filter((p) => {
      if (activeTab === 'Landing Pages' && p.type !== 'Landing') return false;
      if (activeTab === 'System Pages' && p.type !== 'System') return false;
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (typeFilter !== 'All' && p.type !== typeFilter) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.slug.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [pages, activeTab, statusFilter, typeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredPages.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const visiblePages = filteredPages.slice(pageStart, pageStart + pageSize);
  const selectedPage = pages.find((p) => p.id === selectedPageId) || pages[0];

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setTypeFilter('All');
    setActiveTab('All Pages');
    setPage(1);
  };

  const handleSelect = (p) => {
    setSelectedPageId(p.id);
    setDetailTab('Content');
  };

  const handleCreate = (newPage) => {
    addPage(siteId, newPage);
    setShowAddModal(false);
  };

  const handleDelete = (p) => {
    if (window.confirm(`Delete "${p.title}"? This can't be undone.`)) {
      deletePage(siteId, p.id);
      if (selectedPageId === p.id) setSelectedPageId(null);
    }
    setOpenActionMenu(null);
  };

  const handleToggleStatus = (p) => {
    updatePage(siteId, p.id, { status: p.status === 'Published' ? 'Draft' : 'Published' });
    setOpenActionMenu(null);
  };

  const handleDrop = (targetId) => {
    if (!dragId || dragId === targetId) return;
    const ids = pages.map((p) => p.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    reorderPages(siteId, ids);
    setDragId(null);
  };

  if (!site) return null;

  return (
    <section>
      <div className="pages-page-header">
        <div>
          <h2 className="section-title" style={{ marginBottom: 4 }}>Pages</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage and organize all pages of your website.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" title="Preview not available in this demo">
            <ExternalLink size={16} /> Preview Website
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add New Page
          </button>
        </div>
      </div>

      <div className="pages-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`pages-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="pages-layout">
        <div className="card pages-list-card">
          <div className="pages-filter-bar">
            <div className="pages-search">
              <Search size={16} />
              <input
                placeholder="Search pages…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select className="select-field input-field" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ width: 150 }}>
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
            <select className="select-field input-field" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} style={{ width: 150 }}>
              <option value="All">All Types</option>
              <option value="Landing">Landing</option>
              <option value="Page">Page</option>
              <option value="Listing">Listing</option>
              <option value="Single">Single</option>
              <option value="System">System</option>
            </select>
            <button className="header-icon-btn" title="Reset filters" onClick={resetFilters}>
              <Filter size={16} />
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table pages-table">
              <thead>
                <tr>
                  <th style={{ width: 28 }}></th>
                  <th>Page Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visiblePages.map((p) => {
                  const Icon = TYPE_ICON[p.type] || FileText;
                  const isSelected = selectedPage?.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      className={isSelected ? 'pages-row-selected' : ''}
                      onClick={() => handleSelect(p)}
                      draggable
                      onDragStart={() => setDragId(p.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(p.id)}
                    >
                      <td>
                        <GripVertical size={16} className="pages-drag-handle" />
                      </td>
                      <td>
                        <div className="pages-name-cell">
                          <span className="pages-name-icon"><Icon size={16} /></span>
                          <div>
                            <div className="pages-name-title">{p.title}</div>
                            <div className="pages-name-slug">{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-info">{p.type}</span></td>
                      <td>
                        <span className={`badge ${p.status === 'Published' ? 'badge-success' : 'badge-warning'}`}>{p.status}</span>
                      </td>
                      <td>
                        <div className="pages-updated-cell">
                          <span className="pages-avatar">{p.updatedBy.initials}</span>
                          <span>{formatDate(p.lastUpdated)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="pages-actions-cell" onClick={(e) => e.stopPropagation()}>
                          <button className="header-icon-btn" title="Preview"><Eye size={15} /></button>
                          <button className="header-icon-btn" title="Edit" onClick={() => handleSelect(p)}><Pencil size={15} /></button>
                          <div className="pages-action-menu-wrap">
                            <button
                              className="header-icon-btn"
                              title="More actions"
                              onClick={() => setOpenActionMenu(openActionMenu === p.id ? null : p.id)}
                            >
                              <MoreVertical size={15} />
                            </button>
                            {openActionMenu === p.id && (
                              <div className="sidebar-profile-dropdown pages-action-dropdown">
                                <button onClick={() => handleToggleStatus(p)}>
                                  {p.status === 'Published' ? 'Unpublish' : 'Publish'}
                                </button>
                                <button onClick={() => handleDelete(p)} className="danger">
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visiblePages.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 32 }}>
                      No pages match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-bar">
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              Showing {filteredPages.length === 0 ? 0 : pageStart + 1} to {Math.min(pageStart + pageSize, filteredPages.length)} of {filteredPages.length} pages
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="header-icon-btn" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={`pagination-page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>
                  {n}
                </button>
              ))}
              <button className="header-icon-btn" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                <ChevronRight size={16} />
              </button>
              <select
                className="select-field input-field"
                style={{ width: 100 }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </div>

        {selectedPage && (
          <div className="card pages-detail-card">
            <div className="pages-detail-header">
              <div>
                <div className="pages-detail-title">
                  {selectedPage.title}
                  <span className={`badge ${selectedPage.status === 'Published' ? 'badge-success' : 'badge-warning'}`} style={{ marginLeft: 8 }}>
                    {selectedPage.status}
                  </span>
                </div>
                <div className="pages-name-slug">{selectedPage.slug}</div>
              </div>
            </div>

            <div className="pages-detail-tabs">
              {['Content', 'SEO', 'Settings', 'History'].map((t) => (
                <button key={t} className={`pages-detail-tab ${detailTab === t ? 'active' : ''}`} onClick={() => setDetailTab(t)}>
                  {t}
                </button>
              ))}
            </div>

            {detailTab === 'Content' && (
              <div className="pages-detail-body">
                <div className="form-group">
                  <label className="form-label">Page Title</label>
                  <input
                    className="input-field"
                    value={selectedPage.title}
                    onChange={(e) => updatePage(siteId, selectedPage.id, { title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Page Slug</label>
                  <input
                    className="input-field"
                    value={selectedPage.slug}
                    onChange={(e) => updatePage(siteId, selectedPage.id, { slug: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Meta Description</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    maxLength={160}
                    value={selectedPage.metaDescription}
                    onChange={(e) => updatePage(siteId, selectedPage.id, { metaDescription: e.target.value })}
                  />
                  <div className="char-counter">{selectedPage.metaDescription.length} / 160 characters</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Page Builder Preview</label>
                  <div className="page-builder-preview">
                    <div className="page-builder-preview-headline">{selectedPage.title}</div>
                    <div className="page-builder-preview-sub">{selectedPage.metaDescription || 'No description yet.'}</div>
                  </div>
                </div>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} title="Page builder is not available in this demo">
                  <Pencil size={14} /> Edit with Page Builder
                </button>
              </div>
            )}

            {detailTab === 'SEO' && (
              <div className="pages-detail-body">
                <div className="form-group">
                  <label className="form-label">SEO Title</label>
                  <input
                    className="input-field"
                    value={selectedPage.seoTitle}
                    placeholder={selectedPage.title}
                    onChange={(e) => updatePage(siteId, selectedPage.id, { seoTitle: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Meta Description</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    maxLength={160}
                    value={selectedPage.metaDescription}
                    onChange={(e) => updatePage(siteId, selectedPage.id, { metaDescription: e.target.value })}
                  />
                  <div className="char-counter">{selectedPage.metaDescription.length} / 160 characters</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Canonical Path</label>
                  <input className="input-field" value={selectedPage.slug} readOnly />
                </div>
              </div>
            )}

            {detailTab === 'Settings' && (
              <div className="pages-detail-body">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="select-field input-field"
                    value={selectedPage.status}
                    onChange={(e) => updatePage(siteId, selectedPage.id, { status: e.target.value })}
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Page Type</label>
                  <select
                    className="select-field input-field"
                    value={selectedPage.type}
                    onChange={(e) => updatePage(siteId, selectedPage.id, { type: e.target.value })}
                  >
                    <option value="Page">Page</option>
                    <option value="Landing">Landing</option>
                    <option value="Listing">Listing</option>
                    <option value="Single">Single</option>
                    <option value="System">System</option>
                  </select>
                </div>
                <button className="btn" style={{ width: '100%', justifyContent: 'center', background: 'var(--error-color)', color: '#fff' }} onClick={() => handleDelete(selectedPage)}>
                  <Trash2 size={14} /> Delete Page
                </button>
              </div>
            )}

            {detailTab === 'History' && (
              <div className="pages-detail-body">
                <ul className="pages-history-list">
                  <li>
                    <strong>{selectedPage.updatedBy.name}</strong> updated this page
                    <div className="pages-name-slug">{formatDate(selectedPage.lastUpdated)}</div>
                  </li>
                  <li>
                    <strong>{selectedPage.createdBy.name}</strong> created this page
                    <div className="pages-name-slug">{formatDate(selectedPage.createdAt)}</div>
                  </li>
                </ul>
              </div>
            )}

            <div className="pages-detail-footer">
              <div>
                <div className="pages-name-slug">Created By</div>
                <div className="pages-updated-cell">
                  <span className="pages-avatar">{selectedPage.createdBy.initials}</span>
                  <div>
                    <div>{selectedPage.createdBy.name}</div>
                    <div className="pages-name-slug">{formatDate(selectedPage.createdAt)}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="pages-name-slug">Last Updated By</div>
                <div className="pages-updated-cell">
                  <span className="pages-avatar">{selectedPage.updatedBy.initials}</span>
                  <div>
                    <div>{selectedPage.updatedBy.name}</div>
                    <div className="pages-name-slug">{formatDate(selectedPage.lastUpdated)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddModal && <AddPageModal onClose={() => setShowAddModal(false)} onCreate={handleCreate} />}
    </section>
  );
};

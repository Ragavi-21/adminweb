import React, { useState } from 'react';
import {
  LayoutDashboard,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Users,
  BarChart3,
  ClipboardList,
  ClipboardCheck,
  Clock,
  Settings,
  Plug,
  DatabaseBackup,
  LifeBuoy,
  Box,
  ShoppingBag,
  CloudUpload,
  Brain,
  Car,
  User,
  MoreVertical,
  LogOut,
  Hexagon,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

const sites = [
  { id: 'dendo', name: 'Dendo', icon: Box, color: 'hsl(270,85%,60%)' },
  { id: 'dendo-quick', name: 'Dendo Quick', icon: CloudUpload, color: 'hsl(190,90%,50%)' },
  { id: 'cravix', name: 'Cravix', icon: ShoppingBag, color: 'hsl(340,85%,55%)' },
  { id: 'nexa-ride', name: 'Nexa Ride', icon: Car, color: 'hsl(35,95%,55%)' },
  { id: 'zen', name: 'Zen', icon: Brain, color: 'hsl(150,60%,45%)' },
  { id: 'work-portfolio', name: 'Work Portfolio', icon: User, color: 'hsl(210,85%,55%)' },
];

const otherNavItems = [
  { id: 'dendo-reg', name: 'Dendo Reg', icon: ClipboardCheck, accent: true },
  { id: 'users', name: 'Users', icon: Users },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'reports', name: 'Reports', icon: ClipboardList },
  { id: 'activity-logs', name: 'Activity Logs', icon: Clock },
  { id: 'settings', name: 'Settings', icon: Settings },
  { id: 'integrations', name: 'Integrations', icon: Plug },
  { id: 'backup-restore', name: 'Backup & Restore', icon: DatabaseBackup },
  { id: 'support', name: 'Support', icon: LifeBuoy },
];

export const Sidebar = () => {
  const {
    activeNav,
    setActiveNav,
    activeSite,
    goToSite,
    websitesExpanded,
    setWebsitesExpanded,
    sidebarOpen,
    setSidebarOpen,
    currentUser,
    logout,
  } = useDashboard();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleWebsitesClick = () => {
    if (activeNav !== 'websites') {
      setActiveNav('websites');
      setWebsitesExpanded(true);
    } else {
      setWebsitesExpanded(!websitesExpanded);
    }
  };

  const handleSiteClick = (siteId) => {
    goToSite(siteId);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleNavClick = (navId) => {
    setActiveNav(navId);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <aside
      className="sidebar"
      style={{
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(12px)',
        width: sidebarOpen ? 260 : 0,
        overflow: 'hidden',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-normal)',
      }}
    >
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">
          <Hexagon size={20} fill="var(--accent-color)" color="var(--accent-color)" />
        </span>
        <div>
          <div className="sidebar-brand-title">Super Admin</div>
          <div className="sidebar-brand-subtitle">Control Panel</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavClick('dashboard')}
        >
          <LayoutDashboard size={18} className="sidebar-nav-icon" />
          <span>Dashboard</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeNav === 'websites' ? 'active' : ''}`}
          onClick={handleWebsitesClick}
        >
          <LayoutGrid size={18} className="sidebar-nav-icon" />
          <span>Websites</span>
          {websitesExpanded ? <ChevronDown size={16} className="sidebar-chevron" /> : <ChevronRight size={16} className="sidebar-chevron" />}
        </button>

        {websitesExpanded && (
          <div className="sidebar-submenu">
            {sites.map((site) => {
              const isActive = activeNav === 'websites' && activeSite === site.id;
              return (
                <button
                  key={site.id}
                  onClick={() => handleSiteClick(site.id)}
                  className={`sidebar-submenu-item ${isActive ? 'active' : ''}`}
                >
                  <span className="sidebar-site-dot" style={{ background: site.color }} />
                  <span>{site.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {otherNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''} ${item.accent ? 'dendo-reg-nav' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <Icon size={18} className="sidebar-nav-icon" />
              <span>{item.name}</span>
              {item.accent && <span className="sidebar-nav-badge">Live</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-profile">
        <div className="sidebar-profile-avatar">{currentUser.initials}</div>
        <div className="sidebar-profile-info">
          <div className="sidebar-profile-name">{currentUser.name}</div>
          <div className="sidebar-profile-role">{currentUser.role}</div>
          <div className="sidebar-profile-status">
            <span className="sidebar-status-dot" /> Online
          </div>
        </div>
        <div className="sidebar-profile-menu-wrap">
          <button
            aria-label="Profile menu"
            className="sidebar-profile-menu-btn"
            onClick={() => setProfileMenuOpen((v) => !v)}
          >
            <MoreVertical size={16} />
          </button>
          {profileMenuOpen && (
            <div className="sidebar-profile-dropdown">
              <button onClick={logout}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

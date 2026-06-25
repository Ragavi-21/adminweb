import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Bell, Search, Maximize, Minimize, Menu, ChevronRight, Sun, Moon } from 'lucide-react';

const navLabels = {
  dashboard: 'Dashboard',
  users: 'Users',
  analytics: 'Analytics',
  reports: 'Reports',
  'activity-logs': 'Activity Logs',
  settings: 'Settings',
  integrations: 'Integrations',
  'backup-restore': 'Backup & Restore',
  support: 'Support',
};

const siteNames = {
  dendo: 'Dendo',
  cravix: 'Cravix',
  'dendo-quick': 'Dendo Quick',
  zen: 'Zen',
  'nexa-ride': 'Nexa Ride',
  'work-portfolio': 'Work Portfolio',
};

export const Header = () => {
  const {
    activeNav,
    activeSite,
    activeView,
    sidebarOpen,
    setSidebarOpen,
    notificationsOpen,
    setNotificationsOpen,
    searchQuery,
    setSearchQuery,
    data,
    currentUser,
    theme,
    toggleTheme,
  } = useDashboard();

  const [isFullscreen, setIsFullscreen] = useState(false);

  const breadcrumb =
    activeNav === 'websites'
      ? ['Websites', siteNames[activeSite], activeView === 'pages' ? 'Pages' : 'Overview']
      : [navLabels[activeNav] || 'Dashboard'];

  const unreadCount = data?.notifications?.length || 0;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <header
      className="header"
      style={{
        background: 'var(--header-bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div className="header-left">
        <button
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="header-icon-btn"
        >
          <Menu size={20} />
        </button>
        <nav className="breadcrumb">
          {breadcrumb.map((crumb, i) => (
            <React.Fragment key={crumb}>
              {i > 0 && <ChevronRight size={14} className="breadcrumb-sep" />}
              <span className={i === breadcrumb.length - 1 ? 'breadcrumb-current' : 'breadcrumb-item'}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="header-right">
        <div className="header-search">
          <Search size={16} className="header-search-icon" />
          <input
            type="text"
            placeholder="Search anything…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd className="header-search-kbd">⌘K</kbd>
        </div>

        <button onClick={toggleTheme} className="header-icon-btn" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button onClick={toggleFullscreen} className="header-icon-btn" aria-label="Toggle fullscreen">
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>

        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="header-icon-btn header-notif-btn"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="header-notif-badge">{unreadCount}</span>}
        </button>

        <div className="header-avatar" title={currentUser.name}>
          {currentUser.initials}
        </div>
      </div>
    </header>
  );
};

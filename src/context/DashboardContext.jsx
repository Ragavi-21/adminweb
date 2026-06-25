import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDashboardData } from '../services/api';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  // existing state
  const [activeSite, setActiveSite] = useState('dendo');
  const [theme, setTheme] = useState(() => {
    const cached = localStorage.getItem('dendo_dashboard_theme');
    return cached || 'dark';
  });
  const [dateRange, setDateRange] = useState('7d');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // top-level sidebar navigation: dashboard | websites | users | analytics |
  // reports | activity-logs | settings | integrations | backup-restore | support
  const [activeNav, setActiveNav] = useState('dashboard');
  // when activeNav === 'websites', which sub-screen of the site is shown
  const [activeView, setActiveView] = useState('overview');
  const [websitesExpanded, setWebsitesExpanded] = useState(true);
  const [selectedPageId, setSelectedPageId] = useState(null);

  const goToSite = (siteId) => {
    setActiveNav('websites');
    setActiveSite(siteId);
    setActiveView('overview');
    setSelectedPageId(null);
  };

  const currentUser = { name: 'Super Admin', role: 'Administrator', initials: 'SA' };

  // authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = localStorage.getItem('dendo_admin_auth');
    return stored === 'true';
  });

  const login = (username, password) => {
    // Simple hard‑coded admin credentials (you can replace with real auth later)
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('dendo_admin_auth', 'true');
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('dendo_admin_auth');
  };

  // Grab the live dashboard API state and handlers
  const apiData = useDashboardData();

  // Handle theme class on root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
    localStorage.setItem('dendo_dashboard_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <DashboardContext.Provider
      value={{
        activeSite,
        setActiveSite,
        theme,
        setTheme,
        toggleTheme,
        dateRange,
        setDateRange,
        sidebarOpen,
        setSidebarOpen,
        notificationsOpen,
        setNotificationsOpen,
        searchQuery,
        setSearchQuery,
        isAuthenticated,
        login,
        logout,
        activeNav,
        setActiveNav,
        activeView,
        setActiveView,
        websitesExpanded,
        setWebsitesExpanded,
        selectedPageId,
        setSelectedPageId,
        goToSite,
        currentUser,
        ...apiData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

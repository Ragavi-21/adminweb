import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { GlobalOverview } from './components/GlobalOverview';
import { DendoDashboard } from './components/DendoDashboard';
import { CravixDashboard } from './components/CravixDashboard';
import { DendoQuickDashboard } from './components/DendoQuickDashboard';
import { ZenDashboard } from './components/ZenDashboard';
import { NexaRideDashboard } from './components/NexaRideDashboard';
import { WorkPortfolioDashboard } from './components/WorkPortfolioDashboard';
import { PagesManager } from './components/PagesManager';
import { PlaceholderPanel } from './components/PlaceholderPanel';
import { DendoReg } from './components/DendoReg';
import { Login } from './components/Login';

const siteOverviewComponents = {
  dendo: DendoDashboard,
  cravix: CravixDashboard,
  'dendo-quick': DendoQuickDashboard,
  zen: ZenDashboard,
  'nexa-ride': NexaRideDashboard,
  'work-portfolio': WorkPortfolioDashboard,
};

const navTitles = {
  users: 'Users',
  analytics: 'Analytics',
  reports: 'Reports',
  'activity-logs': 'Activity Logs',
  settings: 'Settings',
  integrations: 'Integrations',
  'backup-restore': 'Backup & Restore',
  support: 'Support',
};

const WebsiteContent = () => {
  const { activeSite, activeView, setActiveView } = useDashboard();
  const SiteOverview = siteOverviewComponents[activeSite] || DendoDashboard;

  return (
    <>
      <div className="site-subnav">
        <button className={`pages-tab ${activeView === 'overview' ? 'active' : ''}`} onClick={() => setActiveView('overview')}>
          Overview
        </button>
        <button className={`pages-tab ${activeView === 'pages' ? 'active' : ''}`} onClick={() => setActiveView('pages')}>
          Pages
        </button>
      </div>
      {activeView === 'pages' ? <PagesManager siteId={activeSite} /> : <SiteOverview />}
    </>
  );
};

const MainContent = () => {
  const { activeNav } = useDashboard();
  if (activeNav === 'dashboard') return <GlobalOverview />;
  if (activeNav === 'websites') return <WebsiteContent />;
  if (activeNav === 'dendo-reg') return <DendoReg />;
  return <PlaceholderPanel title={navTitles[activeNav] || 'Dashboard'} />;
};

function App() {
  return (
    <DashboardProvider>
      <AppContent />
    </DashboardProvider>
  );
}

const AppContent = () => {
  const { isAuthenticated, sidebarOpen } = useDashboard();
  return isAuthenticated ? (
    <Router>
      <div className="dashboard-layout">
        <Sidebar />
        <div className={`dashboard-main ${sidebarOpen ? '' : 'sidebar-closed'}`}>
          <Header />
          <main className="dashboard-content">
            <MainContent />
          </main>
        </div>
      </div>
    </Router>
  ) : (
    <Login />
  );
};

export default App;

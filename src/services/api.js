// Updated mock API with backend data for Dendo, Cravix, Zen, and WorkPortfolio
import { useState, useEffect } from 'react';

// Helper to generate random IDs
const randId = (prefix) => `${prefix}-${Math.floor(Math.random() * 9000) + 1000}`;

const generateHistoricalData = (siteName, multiplier = 1) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => ({
    day,
    traffic: Math.floor((3000 + Math.random() * 2000) * multiplier),
    performance: Math.floor(85 + Math.random() * 15),
    revenue: Math.floor((1000 + Math.random() * 1500) * multiplier),
  }));
};

// CMS "Pages" backend (per site) -------------------------------------------
const ADMIN = { initials: 'SA', name: 'Super Admin' };

const makePage = (overrides) => ({
  id: randId('pg'),
  type: 'Page',
  status: 'Published',
  metaDescription: '',
  seoTitle: '',
  createdBy: ADMIN,
  createdAt: '2025-05-01T10:00:00',
  updatedBy: ADMIN,
  lastUpdated: '2025-05-01T10:00:00',
  ...overrides,
});

const dendoPages = [
  makePage({ title: 'Home', slug: '/', type: 'Landing', lastUpdated: '2025-05-20T10:30:00', metaDescription: 'Dendo helps you streamline your workflow, build beautiful products and grow your business.' }),
  makePage({ title: 'About Us', slug: '/about', type: 'Page', lastUpdated: '2025-05-19T16:15:00' }),
  makePage({ title: 'Services', slug: '/services', type: 'Page', lastUpdated: '2025-05-18T11:20:00' }),
  makePage({ title: 'Pricing', slug: '/pricing', type: 'Page', status: 'Draft', lastUpdated: '2025-05-17T14:40:00' }),
  makePage({ title: 'Blog', slug: '/blog', type: 'Listing', lastUpdated: '2025-05-16T09:10:00' }),
  makePage({ title: 'Blog Details', slug: '/blog/[id]', type: 'Single', lastUpdated: '2025-05-15T15:25:00' }),
  makePage({ title: 'Contact Us', slug: '/contact', type: 'Page', lastUpdated: '2025-05-14T10:05:00' }),
  makePage({ title: 'Terms & Conditions', slug: '/terms', type: 'Page', lastUpdated: '2025-05-10T13:15:00' }),
  makePage({ title: 'Privacy Policy', slug: '/privacy', type: 'Page', lastUpdated: '2025-05-09T11:45:00' }),
  makePage({ title: '404 Not Found', slug: '/404', type: 'System', lastUpdated: '2025-05-01T00:00:00' }),
  makePage({ title: 'Careers', slug: '/careers', type: 'Page', status: 'Draft', lastUpdated: '2025-04-28T09:00:00' }),
  makePage({ title: 'Promo Landing', slug: '/promo', type: 'Landing', status: 'Draft', lastUpdated: '2025-04-22T17:30:00' }),
];

const cravixPages = [
  makePage({ title: 'Home', slug: '/', type: 'Landing', lastUpdated: '2025-05-12T10:00:00' }),
  makePage({ title: 'About', slug: '/about', type: 'Page', lastUpdated: '2025-05-11T10:00:00' }),
  makePage({ title: 'Shop', slug: '/shop', type: 'Listing', lastUpdated: '2025-05-10T10:00:00' }),
  makePage({ title: 'Product Details', slug: '/shop/[id]', type: 'Single', lastUpdated: '2025-05-09T10:00:00' }),
  makePage({ title: 'Contact', slug: '/contact', type: 'Page', lastUpdated: '2025-05-08T10:00:00' }),
  makePage({ title: 'Privacy Policy', slug: '/privacy', type: 'Page', lastUpdated: '2025-05-07T10:00:00' }),
];

const dendoQuickPages = [
  makePage({ title: 'Home', slug: '/', type: 'Landing', lastUpdated: '2025-05-12T10:00:00' }),
  makePage({ title: 'Features', slug: '/features', type: 'Page', lastUpdated: '2025-05-11T10:00:00' }),
  makePage({ title: 'Pricing', slug: '/pricing', type: 'Page', lastUpdated: '2025-05-10T10:00:00' }),
  makePage({ title: 'Contact', slug: '/contact', type: 'Page', lastUpdated: '2025-05-09T10:00:00' }),
];

const zenPages = [
  makePage({ title: 'Home', slug: '/', type: 'Landing', lastUpdated: '2025-05-12T10:00:00' }),
  makePage({ title: 'About', slug: '/about', type: 'Page', lastUpdated: '2025-05-11T10:00:00' }),
  makePage({ title: 'Programs', slug: '/programs', type: 'Listing', lastUpdated: '2025-05-10T10:00:00' }),
  makePage({ title: 'Contact', slug: '/contact', type: 'Page', lastUpdated: '2025-05-09T10:00:00' }),
  makePage({ title: 'Privacy Policy', slug: '/privacy', type: 'Page', lastUpdated: '2025-05-08T10:00:00' }),
];

const nexaRidePages = [
  makePage({ title: 'Home', slug: '/', type: 'Landing', lastUpdated: '2025-05-12T10:00:00' }),
  makePage({ title: 'How It Works', slug: '/how-it-works', type: 'Page', lastUpdated: '2025-05-11T10:00:00' }),
  makePage({ title: 'Drivers', slug: '/drivers', type: 'Page', lastUpdated: '2025-05-10T10:00:00' }),
  makePage({ title: 'Contact', slug: '/contact', type: 'Page', lastUpdated: '2025-05-09T10:00:00' }),
];

const workPortfolioPages = [
  makePage({ title: 'Home', slug: '/', type: 'Landing', lastUpdated: '2025-05-12T10:00:00' }),
  makePage({ title: 'Projects', slug: '/projects', type: 'Listing', lastUpdated: '2025-05-11T10:00:00' }),
  makePage({ title: 'Project Details', slug: '/projects/[id]', type: 'Single', lastUpdated: '2025-05-10T10:00:00' }),
  makePage({ title: 'About', slug: '/about', type: 'Page', lastUpdated: '2025-05-09T10:00:00' }),
  makePage({ title: 'Contact', slug: '/contact', type: 'Page', lastUpdated: '2025-05-08T10:00:00' }),
];

const initialData = {
  global: {
    totalRevenue: 250000,
    totalTraffic: 150000,
    activeUsers: 9000,
    averageUptime: 98.5,
  },
  sites: {
    dendo: {
      name: 'Dendo',
      id: 'dendo',
      themeColor: '270,85%,60%',
      description: 'Enterprise SaaS Collaboration platform',
      // Vendor/driver/zone/contact data for Dendo now comes live from the
      // real dendopvy backend (see services/dendoApi.js), not this mock store.
      historical: generateHistoricalData('dendo'),
      pages: dendoPages,
    },
    cravix: {
      name: 'Cravix',
      id: 'cravix',
      themeColor: '340,85%,55%',
      description: 'Designer E‑commerce boutique',
      // Vendor/driver/zone/contact data for Cravix now comes live from the
      // real Cravix backend (see services/cravixApi.js), not this mock store.
      historical: generateHistoricalData('cravix'),
      pages: cravixPages,
    },
    'dendo-quick': {
      name: 'Dendo Quick',
      id: 'dendo-quick',
      themeColor: '190,90%,50%',
      description: 'Fast file sharing & link shortener',
      historical: generateHistoricalData('dendo-quick'),
      pages: dendoQuickPages,
    },
    zen: {
      name: 'Zen',
      id: 'zen',
      themeColor: '150,60%,45%',
      description: 'Mindfulness & meditation app',
      contacts: [
        { id: randId('c'), type: 'Foundation', name: 'Eve Zhang', email: 'eve@zenapp.com' },
        { id: randId('c'), type: 'Internship', name: 'Frank Liu', email: 'frank@zenapp.com' },
        { id: randId('c'), type: 'Support', name: 'Grace Kim', email: 'support@zenapp.com' },
      ],
      historical: generateHistoricalData('zen'),
      pages: zenPages,
    },
    'nexa-ride': {
      name: 'Nexa Ride',
      id: 'nexa-ride',
      themeColor: '35,95%,55%',
      description: 'Ride‑hailing & fleet tracking',
      historical: generateHistoricalData('nexa-ride'),
      pages: nexaRidePages,
    },
    'work-portfolio': {
      name: 'Work Portfolio',
      id: 'work-portfolio',
      themeColor: '210,85%,55%',
      description: 'Professional portfolio & leads',
      contacts: [
        { id: randId('c'), type: 'Foundation', name: 'Helen Park', email: 'helen@portfolio.com' },
        { id: randId('c'), type: 'Internship', name: 'Ian Choi', email: 'ian@portfolio.com' },
        { id: randId('c'), type: 'Contact', name: 'Jack Miller', email: 'jack@portfolio.com' },
      ],
      historical: generateHistoricalData('work-portfolio'),
      pages: workPortfolioPages,
    },
  },
  notifications: [],
};

export const useDashboardData = () => {
  const [data, setData] = useState(() => {
    const cached = localStorage.getItem('dendo_dashboard_db');
    if (!cached) return initialData;
    const parsed = JSON.parse(cached);
    // Backfill `pages` for sites cached before the Pages CMS feature existed.
    Object.keys(initialData.sites).forEach((siteId) => {
      if (parsed.sites[siteId] && !parsed.sites[siteId].pages) {
        parsed.sites[siteId].pages = initialData.sites[siteId].pages;
      }
    });
    return parsed;
  });

  useEffect(() => {
    localStorage.setItem('dendo_dashboard_db', JSON.stringify(data));
  }, [data]);

  // Simulate live updates (few seconds interval)
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        // Random traffic bump
        next.global.activeUsers = Math.max(100, next.global.activeUsers + (Math.random() > 0.5 ? 5 : -3));
        // Add random notification
        if (Math.random() > 0.9) {
          next.notifications.unshift({
            id: `nt-${Date.now()}`,
            site: 'dendo',
            type: 'info',
            text: `New driver request received`,
            time: 'Just now',
          });
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Pages CMS mutators -----------------------------------------------------
  const addPage = (siteId, page) => {
    const now = new Date().toISOString();
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.sites[siteId].pages.unshift(
        makePage({ ...page, createdBy: ADMIN, createdAt: now, updatedBy: ADMIN, lastUpdated: now })
      );
      return next;
    });
  };

  const updatePage = (siteId, pageId, updates) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const pages = next.sites[siteId].pages;
      const idx = pages.findIndex((p) => p.id === pageId);
      if (idx !== -1) {
        pages[idx] = {
          ...pages[idx],
          ...updates,
          updatedBy: ADMIN,
          lastUpdated: new Date().toISOString(),
        };
      }
      return next;
    });
  };

  const deletePage = (siteId, pageId) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.sites[siteId].pages = next.sites[siteId].pages.filter((p) => p.id !== pageId);
      return next;
    });
  };

  const reorderPages = (siteId, orderedIds) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const byId = Object.fromEntries(next.sites[siteId].pages.map((p) => [p.id, p]));
      next.sites[siteId].pages = orderedIds.map((id) => byId[id]);
      return next;
    });
  };

  return { data, addPage, updatePage, deletePage, reorderPages };
};

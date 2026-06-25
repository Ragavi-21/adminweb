// Mock API for site metadata/stats (Dendo, Cravix, Zen, etc.), plus the
// Pages CMS which is now backed by a real database — see backend/ and
// services/adminApi.js. Vendor/driver/zone/contact data for Dendo and
// DendoReg comes live from their own real backends (see services/dendoApi.js
// and services/dendoRegApi.js), not this mock store.
import { useState, useEffect, useCallback } from 'react';
import { fetchSitePages, createPage, updatePageApi, deletePageApi, reorderPagesApi } from './adminApi';

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
      historical: generateHistoricalData('dendo'),
      pages: [],
    },
    cravix: {
      name: 'Cravix',
      id: 'cravix',
      themeColor: '340,85%,55%',
      description: 'Designer E‑commerce boutique',
      historical: generateHistoricalData('cravix'),
      pages: [],
    },
    'dendo-quick': {
      name: 'Dendo Quick',
      id: 'dendo-quick',
      themeColor: '190,90%,50%',
      description: 'Fast file sharing & link shortener',
      historical: generateHistoricalData('dendo-quick'),
      pages: [],
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
      pages: [],
    },
    'nexa-ride': {
      name: 'Nexa Ride',
      id: 'nexa-ride',
      themeColor: '35,95%,55%',
      description: 'Ride‑hailing & fleet tracking',
      historical: generateHistoricalData('nexa-ride'),
      pages: [],
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
      pages: [],
    },
  },
  notifications: [],
};

export const useDashboardData = () => {
  const [data, setData] = useState(() => {
    const cached = localStorage.getItem('dendo_dashboard_db');
    if (!cached) return initialData;
    const parsed = JSON.parse(cached);
    Object.keys(initialData.sites).forEach((siteId) => {
      if (!parsed.sites[siteId]) parsed.sites[siteId] = initialData.sites[siteId];
      if (!parsed.sites[siteId].pages) parsed.sites[siteId].pages = [];
    });
    return parsed;
  });
  const [pagesError, setPagesError] = useState(null);

  useEffect(() => {
    localStorage.setItem('dendo_dashboard_db', JSON.stringify(data));
  }, [data]);

  // Load real Pages CMS data from the admin backend for every site once on mount.
  useEffect(() => {
    const siteIds = Object.keys(initialData.sites);
    Promise.all(
      siteIds.map((id) =>
        fetchSitePages(id)
          .then((pages) => ({ id, pages }))
          .catch((err) => ({ id, pages: null, error: err.message }))
      )
    ).then((results) => {
      const failed = results.find((r) => r.error);
      setPagesError(failed ? failed.error : null);
      setData((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        results.forEach(({ id, pages }) => {
          if (pages) next.sites[id].pages = pages;
        });
        return next;
      });
    });
  }, []);

  // Simulate live updates (few seconds interval)
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        next.global.activeUsers = Math.max(100, next.global.activeUsers + (Math.random() > 0.5 ? 5 : -3));
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

  // Pages CMS mutators — persisted via the admin backend ------------------
  const addPage = useCallback(async (siteId, page) => {
    const created = await createPage(siteId, page);
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.sites[siteId].pages.unshift(created);
      return next;
    });
  }, []);

  const updatePage = useCallback(async (siteId, pageId, updates) => {
    const updated = await updatePageApi(pageId, updates);
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const pages = next.sites[siteId].pages;
      const idx = pages.findIndex((p) => p.id === pageId);
      if (idx !== -1) pages[idx] = updated;
      return next;
    });
  }, []);

  const deletePage = useCallback(async (siteId, pageId) => {
    await deletePageApi(pageId);
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.sites[siteId].pages = next.sites[siteId].pages.filter((p) => p.id !== pageId);
      return next;
    });
  }, []);

  const reorderPages = useCallback(async (siteId, orderedIds) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const byId = Object.fromEntries(next.sites[siteId].pages.map((p) => [p.id, p]));
      next.sites[siteId].pages = orderedIds.map((id) => byId[id]);
      return next;
    });
    await reorderPagesApi(siteId, orderedIds);
  }, []);

  return { data, addPage, updatePage, deletePage, reorderPages, pagesError };
};

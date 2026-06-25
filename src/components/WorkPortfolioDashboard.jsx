import React from 'react';
import { useDashboard } from '../context/DashboardContext';

export const WorkPortfolioDashboard = () => {
  const { data } = useDashboard();
  return (
    <section>
      <h2 className="section-title" style={{ color: 'var(--text-primary)' }}>Work Portfolio Dashboard</h2>
      <p>Placeholder for portfolio page views, leads, and contact inbox.</p>
    </section>
  );
};

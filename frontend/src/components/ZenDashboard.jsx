import React from 'react';
import { useDashboard } from '../context/DashboardContext';

export const ZenDashboard = () => {
  const { data } = useDashboard();
  return (
    <section>
      <h2 className="section-title" style={{ color: 'var(--text-primary)' }}>Zen Dashboard</h2>
      <p>Placeholder for Zen meditation app metrics.</p>
    </section>
  );
};

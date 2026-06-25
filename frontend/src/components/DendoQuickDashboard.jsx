import React from 'react';
import { useDashboard } from '../context/DashboardContext';

export const DendoQuickDashboard = () => {
  const { data } = useDashboard();
  return (
    <section>
      <h2 className="section-title" style={{ color: 'var(--text-primary)' }}>Dendo Quick Dashboard</h2>
      <p>Placeholder for Dendo Quick file sharing metrics.</p>
    </section>
  );
};

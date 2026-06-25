import React from 'react';
import { useDashboard } from '../context/DashboardContext';

export const NexaRideDashboard = () => {
  const { data } = useDashboard();
  return (
    <section>
      <h2 className="section-title" style={{ color: 'var(--text-primary)' }}>Nexa Ride Dashboard</h2>
      <p>Placeholder for Nexa Ride fleet & ride metrics.</p>
    </section>
  );
};

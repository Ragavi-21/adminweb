import React from 'react';

export const PlaceholderPanel = ({ title, description }) => (
  <section>
    <h2 className="section-title">{title}</h2>
    <div className="card" style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-secondary)' }}>
      {description || `${title} isn't built yet — coming soon.`}
    </div>
  </section>
);

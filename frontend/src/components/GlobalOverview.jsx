import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const GlobalOverview = () => {
  const { data } = useDashboard();
  const aggregate = data.global;
  const chartData = [
    { name: 'Traffic', value: aggregate.totalTraffic },
    { name: 'Revenue', value: aggregate.totalRevenue },
    { name: 'Users', value: aggregate.activeUsers },
  ];

  return (
    <section>
      <h2 className="section-title" style={{ color: 'var(--text-primary)' }}>Global Overview</h2>
      <div className="grid-stats">
        <div className="card">
          <div className="card-stat">
            <div className="stat-header">
              <span className="stat-title">Total Traffic</span>
            </div>
            <div className="stat-value">{aggregate.totalTraffic.toLocaleString()}</div>
            <div className="stat-footer">Visit count</div>
          </div>
        </div>
        <div className="card">
          <div className="card-stat">
            <div className="stat-header">
              <span className="stat-title">Total Revenue</span>
            </div>
            <div className="stat-value">${aggregate.totalRevenue.toLocaleString()}</div>
            <div className="stat-footer">USD</div>
          </div>
        </div>
        <div className="card">
          <div className="card-stat">
            <div className="stat-header">
              <span className="stat-title">Active Users</span>
            </div>
            <div className="stat-value">{aggregate.activeUsers}</div>
            <div className="stat-footer">Live sessions</div>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Traffic Trend (Last 7 days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.sites.global?.historical || []}>
            <CartesianGrid strokeDasharray="3 3" stroke={"var(--border-color)"} />
            <XAxis dataKey="day" stroke={"var(--text-secondary)"} />
            <YAxis stroke={"var(--text-secondary)"} />
            <Tooltip contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)' }} />
            <Line type="monotone" dataKey="traffic" stroke={"var(--accent-color)"} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

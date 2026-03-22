import React, { useState, useEffect } from 'react';
import { api, socket } from '../api';

export default function DashboardStats() {
  const [stats, setStats] = useState({ requests: 0, deliveries: 0, topZone: 'Loading...' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
          const data = await api.admin.getStats();
          setStats(data);
      } catch (e) {
          console.error(e);
      }
    };

    fetchStats();
    
    // Listen for live updates on requests via Socket.io
    socket.on('new_request', fetchStats);
    socket.on('request_updated', fetchStats);

    return () => {
      socket.off('new_request', fetchStats);
      socket.off('request_updated', fetchStats);
    };
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: '0 0 3rem' }}>Live Analytics overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        <StatCard title="Total Active Requests" value={stats.requests} subtitle="Currently in queue" />
        <StatCard title="Active Riders Delivery" value={stats.deliveries} subtitle="Across all cafeterias" />
        <StatCard title="Peak Delivery Zone" value={stats.topZone} subtitle="Based on all-time orders" />
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <h3 style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>{title}</h3>
      <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', color: '#0f172a' }}>{value}</p>
      <p style={{ margin: 0, color: '#10b981', fontSize: '0.9rem', fontWeight: '500' }}>{subtitle}</p>
    </div>
  );
}

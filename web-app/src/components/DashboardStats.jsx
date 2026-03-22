import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function DashboardStats() {
  const [stats, setStats] = useState({ requests: 0, deliveries: 0, topZone: 'Loading...' });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: requestData } = await supabase.from('requests').select('*');
      const { data: deliveryData } = await supabase.from('deliveries').select('id').eq('status', 'active');
      const { data: locData } = await supabase.from('delivery_locations').select('id, name');

      if (requestData && locData) {
        // Calculate peak delivery zone
        const locationCounts = {};
        requestData.forEach(r => {
          locationCounts[r.delivery_location_id] = (locationCounts[r.delivery_location_id] || 0) + 1;
        });

        let topZoneId = null;
        let max = 0;
        Object.keys(locationCounts).forEach(id => {
          if (locationCounts[id] > max) {
            max = locationCounts[id];
            topZoneId = id;
          }
        });

        const topZoneName = locData.find(l => l.id === topZoneId)?.name || 'N/A';

        setStats({
          requests: requestData.filter(r => r.status !== 'delivered').length,
          deliveries: deliveryData ? deliveryData.length : 0,
          topZone: topZoneName
        });
      }
    };

    fetchStats();
    
    // Listen for live updates on requests
    const sub = supabase.channel('dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
        fetchStats();
      }).subscribe();

    return () => supabase.removeChannel(sub);
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: '0 0 3rem' }}>Live Analytics overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        <StatCard title="Total Active Requests" value={stats.requests} subtitle="Currently in queue" />
        <StatCard title="Active Riders Delivery" value={stats.deliveries} subtitle="Across 2 cafeterias" />
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

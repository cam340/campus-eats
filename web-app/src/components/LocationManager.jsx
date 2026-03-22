import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function LocationManager() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data } = await supabase.from('delivery_locations').select('*').order('name');
    if (data) setLocations(data);
  };

  const toggleLocation = async (id, currentStatus) => {
    await supabase.from('delivery_locations').update({ is_active: !currentStatus }).eq('id', id);
    fetchLocations();
  };

  return (
    <div>
      <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: '0 0 0.5rem' }}>Delivery Locations</h2>
      <p style={{ color: '#64748b', marginBottom: '3rem' }}>Configure exactly where riders are allowed to deliver on campus.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {locations.map(loc => (
          <div key={loc.id} style={{ background: 'white', padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>{loc.name}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>{loc.description || 'No description provided'}</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', background: '#f1f5f9', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: '500' }}>
                    Delivery Fee: ${parseFloat(loc.fee || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ padding: '0.5rem 1rem', background: loc.is_active ? '#dcfce7' : '#fee2e2', color: loc.is_active ? '#166534' : '#991b1b', borderRadius: '0.5rem', fontWeight: 'bold' }}>
                  {loc.is_active ? 'Active' : 'Disabled'}
                </span>
                <button 
                  onClick={() => toggleLocation(loc.id, loc.is_active)}
                  style={{ padding: '0.5rem 1.5rem', border: '1px solid #cbd5e1', background: 'white', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  Toggle Status
                </button>
              </div>
            </div>
          </div>
        ))}
        {locations.length === 0 && <p>No locations defined in database.</p>}
      </div>
      
      <button style={{ marginTop: '3rem', background: '#0ea5e9', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
        + Add Delivery Location
      </button>
    </div>
  );
}

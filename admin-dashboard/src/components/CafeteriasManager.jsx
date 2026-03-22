import React, { useState, useEffect } from 'react';
import { Store, CheckCircle, XCircle } from 'lucide-react';

export default function CafeteriasManager() {
  const [cafeterias, setCafeterias] = useState([]);

  const fetchCafeterias = () => {
    fetch('http://localhost:4000/api/cafeterias')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCafeterias(data);
        } else {
          // Fallback mock data since Supabase isn't hooked up
          console.error("Backend error, using mock data:", data);
          setCafeterias([
            { id: 'cafe-1', name: 'Main Dining Hall', location: 'Campus Center', is_active: true },
            { id: 'cafe-2', name: 'Northside Eatery', location: 'Engineering Block', is_active: false }
          ]);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCafeterias();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    await fetch(`http://localhost:4000/api/cafeterias/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
    });
    fetchCafeterias();
  };

  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', marginBottom: '20px' }}>
        <Store size={24} color="#f59e0b" /> Campus Cafeterias
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {cafeterias.map(cafe => (
          <div key={cafe.id} style={{ 
            padding: '20px', 
            border: `1px solid ${cafe.is_active ? '#cbd5e1' : '#fecaca'}`, 
            borderRadius: '8px', 
            background: cafe.is_active ? '#ffffff' : '#fef2f2' 
          }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#0f172a', display: 'flex', justifyContent: 'space-between' }}>
                {cafe.name}
                {cafe.is_active ? <CheckCircle size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />}
            </h3>
            <p style={{ color: '#64748b', margin: '0 0 15px 0' }}>{cafe.location || 'Campus Center'}</p>
            
            <button 
              onClick={() => toggleStatus(cafe.id, cafe.is_active)}
              style={{
                width: '100%',
                padding: '8px',
                border: 'none',
                borderRadius: '6px',
                background: cafe.is_active ? '#fee2e2' : '#dcfce7',
                color: cafe.is_active ? '#b91c1c' : '#15803d',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {cafe.is_active ? 'Mark as Closed' : 'Mark as Open'}
            </button>
          </div>
        ))}
      </div>
      {cafeterias.length === 0 && (
          <p style={{ textAlign: 'center', color: '#64748b' }}>No cafeterias configured in database.</p>
      )}
    </div>
  );
}

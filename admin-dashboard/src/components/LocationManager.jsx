import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useToast } from './Toast';

export default function LocationManager() {
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newLoc, setNewLoc] = useState({ name: '', fee: '', description: '' });
  const toast = useToast();

  const fetchLocations = async () => {
    try {
        const data = await api.admin.getLocations();
        setLocations(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const toggleLocation = async (id, currentStatus) => {
    try {
        await api.admin.updateLocation(id, !currentStatus);
        toast(`Location ${!currentStatus ? 'activated' : 'disabled'} successfully!`);
        fetchLocations();
    } catch (e) { 
        console.error(e);
        toast('Failed to update location', 'error');
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
        await api.admin.createLocation(newLoc);
        toast('New delivery location added! 🎉');
        setShowModal(false);
        setNewLoc({ name: '', fee: '', description: '' });
        fetchLocations();
    } catch (e) {
        toast(e.message || 'Failed to add location', 'error');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
        <style>
            {`
            @media (max-width: 600px) {
                .location-header { flex-direction: column !important; align-items: stretch !important; gap: 1.5rem !important; }
                .location-header h2 { font-size: 1.75rem !important; }
                .location-card-inner { flex-direction: column !important; align-items: stretch !important; gap: 1.5rem !important; }
                .location-card { padding: 1.5rem !important; border-radius: 20px !important; }
                .add-modal-form { padding: 1.5rem !important; border-radius: 1.5rem !important; width: 95% !important; margin: 10px !important; }
                .add-modal-form h3 { font-size: 1.5rem !important; margin-bottom: 1.5rem !important; }
            }
            `}
        </style>
      <div className="location-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', color: '#0f172a', margin: '0 0 0.5rem', fontWeight: 900 }}>Delivery Locations</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>Configure exactly where riders are allowed to deliver on campus.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '1rem', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)' }}>
          + Add New Zone
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {locations.map(loc => (
          <div key={loc.id} className="location-card" style={{ background: 'white', padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
            <div className="location-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{loc.name}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>{loc.description || 'No description provided'}</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                  <span style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '99px', fontSize: '0.9rem', fontWeight: '700', color: '#475569' }}>
                    Delivery Fee: ${parseFloat(loc.fee || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ padding: '0.5rem 1.25rem', background: loc.is_active ? '#dcfce7' : '#fee2e2', color: loc.is_active ? '#166534' : '#991b1b', borderRadius: '12px', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  {loc.is_active ? 'Active' : 'Disabled'}
                </span>
                <button 
                  onClick={() => toggleLocation(loc.id, loc.is_active)}
                  style={{ padding: '0.75rem 1.25rem', border: '2px solid #e2e8f0', background: 'white', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, color: '#64748b', transition: 'all 0.2s' }}>
                  Toggle
                </button>
              </div>
            </div>
          </div>
        ))}
        {locations.length === 0 && (
            <div style={{ padding: '4rem', background: 'white', borderRadius: '1.5rem', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
                <p style={{ fontSize: '1.2rem', color: '#94a3b8', margin: 0 }}>No delivery zones defined yet. Click "Add New Zone" to start.</p>
            </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <form onSubmit={handleAddLocation} className="add-modal-form" style={{ background: 'white', padding: '3rem', borderRadius: '2rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUpFade 0.3s ease-out' }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '2rem', color: '#0f172a' }}>Add Delivery Zone</h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b' }}>Zone Name</label>
                    <input required value={newLoc.name} onChange={e => setNewLoc({...newLoc, name: e.target.value})} placeholder="e.g. Hall 7 Gate" style={inputStyle} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b' }}>Delivery Fee (₦)</label>
                    <input type="number" step="0.01" required value={newLoc.fee} onChange={e => setNewLoc({...newLoc, fee: e.target.value})} placeholder="e.g. 500" style={inputStyle} />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b' }}>Description</label>
                    <textarea value={newLoc.description} onChange={e => setNewLoc({...newLoc, description: e.target.value})} placeholder="Provide helpful context for riders..." style={{ ...inputStyle, height: '100px', resize: 'none' }} />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" style={{ flex: 1, background: '#0ea5e9', color: 'white', border: 'none', padding: '1.125rem', borderRadius: '1rem', fontWeight: 800, cursor: 'pointer', fontSize: '1.1rem' }}>Save Zone</button>
                    <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '1.125rem', borderRadius: '1rem', fontWeight: 800, cursor: 'pointer', fontSize: '1.1rem' }}>Cancel</button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
    width: '100%', padding: '1rem 1.25rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem', fontWeight: 600, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
};

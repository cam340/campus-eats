import React, { useState } from 'react';
import { User, MapPin, Coins, History, Edit3, Clock } from 'lucide-react';

export default function UserProfile({ user, onBack }) {
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const parsed = user.preferences && user.preferences !== 'null' ? JSON.parse(user.preferences) : {};
  const userPrefs = parsed || {};
  const [editName, setEditName] = useState(user.name);
  const [editDepartment, setEditDepartment] = useState(userPrefs.department || '');
  const [editLevel, setEditLevel] = useState(userPrefs.level || '');
  const [editHostel, setEditHostel] = useState(userPrefs.hostel || '');
  const [editHostelNumber, setEditHostelNumber] = useState(userPrefs.hostelNumber || '');

  const handleSaveProfile = async () => {
    const preferences = { 
        ...userPrefs, 
        department: editDepartment, 
        level: editLevel, 
        hostel: editHostel, 
        hostelNumber: editHostelNumber,
        defaultDorm: `${editHostel}, Room ${editHostelNumber}`
    };
    
    const res = await fetch(`http://localhost:4000/api/users/${user.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, preferences: JSON.stringify(preferences) })
    });
    if (res.ok) {
        localStorage.setItem('campus_user', JSON.stringify(await res.json()));
        window.location.reload();
    }
  };

  return (
    <div className="content">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
         <button onClick={onBack} className="icon-btn" style={{ background: '#e2e8f0', color: '#334155' }}>←</button>
         <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: '#3b82f6', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}>
                    {user.name.charAt(0)}
                </span>
                {user.name}
            </h2>
            <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>{user.email}</p>
         </div>
         <div style={{ background: '#fef3c7', padding: '8px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', color: '#d97706', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
             <Coins size={18} /> 450 Pts
         </div>
      </div>


      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #e2e8f0' }}>
         <button className={`tab-btn ${activeTab === 'details' ? 'tab-active' : ''}`} onClick={() => setActiveTab('details')}>Profile Details</button>
         <button className={`tab-btn ${activeTab === 'history' ? 'tab-active' : ''}`} onClick={() => setActiveTab('history')}>Transaction History</button>
      </div>

      {activeTab === 'details' && (
         <div className="card" style={{ animation: 'fadeIn 0.3s ease' }}>
             <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#0f172a', margin: '0 0 20px 0' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={20} color="#3b82f6" /> Academic Identity</span>
                <button onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Edit3 size={16} /> {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
             </h3>
             <div className="input-group">
                 <label className="label">Full Name</label>
                 <input className="input" type="text" value={editName} onChange={e => setEditName(e.target.value)} disabled={!isEditing} style={{ background: isEditing ? 'white' : '#f8fafc', fontWeight: 'bold' }} />
             </div>
             <div style={{ display: 'flex', gap: '10px' }}>
                 <div className="input-group" style={{ flex: 1.5 }}>
                     <label className="label">Department</label>
                     <input className="input" type="text" value={editDepartment} onChange={e => setEditDepartment(e.target.value)} disabled={!isEditing} style={{ background: isEditing ? 'white' : '#f8fafc' }} placeholder="e.g. Computer Science" />
                 </div>
                 <div className="input-group" style={{ flex: 1 }}>
                     <label className="label">Level</label>
                     <select className="input" value={editLevel} onChange={e => setEditLevel(e.target.value)} disabled={!isEditing} style={{ background: isEditing ? 'white' : '#f8fafc' }}>
                         <option value="">Select Level</option>
                         <option value="100">100 Level</option>
                         <option value="200">200 Level</option>
                         <option value="300">300 Level</option>
                         <option value="400">400 Level</option>
                         <option value="500">500 Level</option>
                     </select>
                 </div>
             </div>
             <div className="input-group">
                 <label className="label">University Email (.edu)</label>
                 <input className="input" type="email" defaultValue={user.email} disabled style={{ background: '#f8fafc' }} />
             </div>
             <div style={{ display: 'flex', gap: '10px' }}>
                 <div className="input-group" style={{ flex: 2 }}>
                     <label className="label">Hostel</label>
                     <input className="input" type="text" value={editHostel} onChange={e => setEditHostel(e.target.value)} disabled={!isEditing} style={{ background: isEditing ? 'white' : '#f8fafc' }} placeholder="e.g. Block A" />
                 </div>
                 <div className="input-group" style={{ flex: 1 }}>
                     <label className="label">Room #</label>
                     <input className="input" type="text" value={editHostelNumber} onChange={e => setEditHostelNumber(e.target.value)} disabled={!isEditing} style={{ background: isEditing ? 'white' : '#f8fafc' }} placeholder="e.g. 12B" />
                 </div>
             </div>
             {isEditing && <button className="btn" style={{ background: '#10b981', marginTop: '10px' }} onClick={handleSaveProfile}>Save Profile Settings</button>}
          </div>
      )}

      {activeTab === 'history' && (
         <div className="card" style={{ animation: 'fadeIn 0.3s ease' }}>
             <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', margin: '0 0 20px 0' }}>
                <History size={20} color="#3b82f6" /> Favor Points Ledger
             </h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 'bold', color: '#0f172a' }}>Library Coffee Delivery</span>
                        <span style={{ fontWeight: 'bold', color: '#ef4444' }}>- 150 Pts</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} /> Yesterday</span>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>Rider: Mike T.</span>
                    </div>
                </div>
                <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 'bold', color: '#0f172a' }}>System Deposit (Semester Bonus)</span>
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>+ 500 Pts</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} /> Sep 1, 2023</span>
                    </div>
                </div>
             </div>
         </div>
      )}
    </div>
  );
}

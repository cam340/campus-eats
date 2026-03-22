import React, { useState, useEffect } from 'react';
import { User, Shield, UserCheck, CheckCircle, ArrowLeft, MapPin, GraduationCap, Building, Mail, BadgeCheck } from 'lucide-react';
import { api } from '../api';

export default function UsersManager() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
        const data = await api.admin.getUsers();
        if (Array.isArray(data)) setUsers(data);
    } catch(err) {
        console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const parsePrefs = (u) => {
      if (!u || !u.preferences || u.preferences === 'null') return {};
      try { return JSON.parse(u.preferences); } catch(e) { return {}; }
  };

  const manuallyVerify = async (user) => {
      const prefs = parsePrefs(user);
      const newPrefs = { ...prefs, is_verified: true, verification_status: 'verified' };
      try {
          await api.admin.updateUser(user.id, JSON.stringify(newPrefs));
          fetchUsers();
          setSelectedUser(null);
      } catch(e) { console.error(e); }
  };



  // ── PROFILE DETAIL VIEW ──
  if (selectedUser) {
      const prefs = parsePrefs(selectedUser);
      return (
          <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontWeight: 'bold', fontSize: '15px', marginBottom: '25px', padding: 0 }}>
                  <ArrowLeft size={18} /> Back to All Users
              </button>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', padding: '20px', background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)', borderRadius: '12px' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: selectedUser.role === 'rider' ? '#10b981' : '#3b82f6', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', fontWeight: 'bold' }}>
                      {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                      <h2 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                          {selectedUser.name} 
                          {prefs.is_verified && <BadgeCheck size={22} color="#10b981" />}
                      </h2>
                      <p style={{ margin: 0, color: '#64748b' }}>{selectedUser.email}</p>
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                          <span style={{ padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', background: selectedUser.role === 'admin' ? '#fee2e2' : selectedUser.role === 'rider' ? '#dcfce7' : '#e0f2fe', color: selectedUser.role === 'admin' ? '#b91c1c' : selectedUser.role === 'rider' ? '#15803d' : '#0369a1' }}>
                              {selectedUser.role.toUpperCase()}
                          </span>
                          <span style={{ padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', background: prefs.is_verified ? '#dcfce7' : prefs.verification_status === 'pending' ? '#fef3c7' : '#fee2e2', color: prefs.is_verified ? '#15803d' : prefs.verification_status === 'pending' ? '#b45309' : '#b91c1c'}}>
                              {prefs.is_verified ? 'VERIFIED' : prefs.verification_status === 'pending' ? 'PENDING' : 'UNVERIFIED'}
                          </span>
                      </div>
                  </div>
              </div>

              {/* Academic & Residence Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                  <InfoCard icon={<GraduationCap size={18} color="#6366f1" />} label="Department" value={prefs.department || 'Not Set'} />
                  <InfoCard icon={<GraduationCap size={18} color="#6366f1" />} label="Level" value={prefs.level ? `${prefs.level} Level` : 'Not Set'} />
                  <InfoCard icon={<Building size={18} color="#f59e0b" />} label="Hostel" value={prefs.hostel || 'Not Set'} />
                  <InfoCard icon={<MapPin size={18} color="#f59e0b" />} label="Room Number" value={prefs.hostelNumber || 'Not Set'} />
                  <InfoCard icon={<Mail size={18} color="#3b82f6" />} label="Email" value={selectedUser.email} />
                  {selectedUser.role === 'rider' && <InfoCard icon={<User size={18} color="#10b981" />} label="Transport" value={prefs.transportMethod || 'Not Set'} />}
              </div>

              {/* Verification Documents */}
              {prefs.verification_status === 'pending' && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
                      <h3 style={{ margin: '0 0 15px 0', color: '#92400e' }}>Verification Documents</h3>
                      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                          {prefs.id_card_url && (
                              <div style={{ textAlign: 'center' }}>
                                  <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#78716c', margin: '0 0 5px' }}>ID Card</p>
                                  <img src={prefs.id_card_url} alt="ID" style={{ width: '180px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e5e7eb' }} />
                              </div>
                          )}
                          {prefs.selfie_url && (
                              <div style={{ textAlign: 'center' }}>
                                  <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#78716c', margin: '0 0 5px' }}>Selfie</p>
                                  <img src={prefs.selfie_url} alt="Selfie" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e5e7eb' }} />
                              </div>
                          )}
                      </div>
                      <button onClick={() => manuallyVerify(selectedUser)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                          ✓ Approve & Verify This User
                      </button>
                  </div>
              )}


          </div>
      );
  }

  // ── TABLE LIST VIEW ──
  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', marginBottom: '20px' }}>
        <User size={24} color="#3b82f6" /> Manage Users
      </h2>
      <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>Click on any user row to view their full profile and verification documents.</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Email</th>
              <th style={{ padding: '12px' }}>Role</th>
              <th style={{ padding: '12px' }}>Verification</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const userPrefs = parsePrefs(user);
              return (
              <tr key={user.id} onClick={() => setSelectedUser(user)} style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background='#f0f9ff'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <td style={{ padding: '12px', fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: user.role === 'rider' ? '#10b981' : '#3b82f6', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', fontWeight: 'bold', flexShrink: 0 }}>
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        {user.name}
                    </div>
                </td>
                <td style={{ padding: '12px', color: '#64748b' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                    background: user.role === 'admin' ? '#fee2e2' : user.role === 'rider' ? '#dcfce7' : '#e0f2fe',
                    color: user.role === 'admin' ? '#b91c1c' : user.role === 'rider' ? '#15803d' : '#0369a1' 
                  }}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {userPrefs.is_verified ? (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', fontSize: '13px' }}><UserCheck size={16} /> Verified</span>
                  ) : userPrefs.verification_status === 'pending' ? (
                      <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 'bold' }}>⏳ Pending Review</span>
                  ) : (
                      <span style={{ color: '#ef4444', fontSize: '13px', fontWeight: 'bold' }}>Unverified</span>
                  )}
                </td>
              </tr>
            );})}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
    return (
        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                {icon}
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</span>
            </div>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{value}</p>
        </div>
    );
}

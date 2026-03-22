import React, { useState } from 'react';
import { Package, Star, Award, Activity, Navigation2, CheckCircle, ShieldCheck, Bike, Footprints, AlertTriangle, Clock, Upload } from 'lucide-react';

export default function RiderProfile({ user, onBack }) {
  const [isOnline, setIsOnline] = useState(true);
  const parsed = user.preferences && user.preferences !== 'null' ? JSON.parse(user.preferences) : {};
  const userPrefs = parsed || {};
  const activeTransport = 'Walking';

  const [idFile, setIdFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);

  const handleFile = (e, setFile) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setFile(reader.result);
          reader.readAsDataURL(file);
      }
  };

  const handleTransportChange = async (method) => {
      const res = await fetch(`http://localhost:4000/api/users/${user.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferences: JSON.stringify({ ...userPrefs, transportMethod: method }) })
      });
      if (res.ok) {
          localStorage.setItem('campus_user', JSON.stringify(await res.json()));
          window.location.reload(); 
      }
  };

  const handleUploadProofs = async () => {
    if (!idFile || !selfieFile) return alert("Please upload both your ID card and a Selfie.");
    const preferences = { 
        ...userPrefs, 
        verification_status: 'pending',
        id_card_url: idFile,
        selfie_url: selfieFile
    };
    const res = await fetch(`http://localhost:4000/api/users/${user.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: JSON.stringify(preferences) })
    });
    if (res.ok) {
        localStorage.setItem('campus_user', JSON.stringify(await res.json()));
        window.location.reload(); 
    }
  };

  return (
    <div className="content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <button onClick={onBack} className="icon-btn" style={{ background: '#e2e8f0', color: '#334155' }}>←</button>
             <div>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                   {user.name} {userPrefs.is_verified && <ShieldCheck size={20} color="#10b981" title="Verified Rider" />}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{user.email.replace('@', '@student.')}</span>
                </div>
             </div>
         </div>
         <button 
            onClick={() => setIsOnline(!isOnline)}
            style={{ 
              background: isOnline ? '#10b981' : '#64748b', 
              color: 'white', border: 'none', padding: '10px 20px', 
              borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}
         >
            <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} />
            {isOnline ? 'Active' : 'Offline'}
         </button>
      </div>

      {!userPrefs.is_verified && (
          <div style={{ background: userPrefs.verification_status === 'pending' ? '#eff6ff' : '#fef2f2', borderLeft: userPrefs.verification_status === 'pending' ? '4px solid #3b82f6' : '4px solid #ef4444', padding: '15px', marginBottom: '25px', borderRadius: '0 8px 8px 0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {userPrefs.verification_status === 'pending' ? <Clock size={20} color="#3b82f6" /> : <AlertTriangle size={20} color="#ef4444" />}
                  <div>
                      <h4 style={{ margin: '0 0 5px 0', color: userPrefs.verification_status === 'pending' ? '#1e3a8a' : '#991b1b' }}>
                          {userPrefs.verification_status === 'pending' ? 'Verification Pending Admin Approval' : 'Action Required: Verify Identity'}
                      </h4>
                      <p style={{ margin: 0, color: userPrefs.verification_status === 'pending' ? '#3b82f6' : '#ef4444', fontSize: '14px' }}>
                          {userPrefs.verification_status === 'pending' ? 'An admin is reviewing your uploaded documents. You will be notified once verified.' : 'Please upload a clear picture of your Student ID Database and a Selfie.'}
                      </p>
                  </div>
              </div>
              {userPrefs.verification_status !== 'pending' && (
                  <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px dashed #ef4444' }}>
                      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                          <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>📄 Upload ID Card</label>
                              <input type="file" accept="image/*" onChange={(e) => handleFile(e, setIdFile)} style={{ fontSize: '13px', width: '100%' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>🤳 Upload Selfie</label>
                              <input type="file" accept="image/*" onChange={(e) => handleFile(e, setSelfieFile)} style={{ fontSize: '13px', width: '100%' }} />
                          </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <button onClick={handleUploadProofs} className="btn" style={{ width: 'auto', background: '#ef4444', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', padding: '12px 40px', fontSize: '15px', fontWeight: 'bold' }}>
                              <Upload size={18} /> Submit Documents for Verification
                          </button>
                      </div>
                  </div>
              )}
          </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
         <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
             <div style={{ color: '#8b5cf6', display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><Package size={28} /></div>
             <h2 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>142</h2>
             <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Drops</p>
         </div>
         <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
             <div style={{ color: '#10b981', display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><Award size={28} /></div>
             <h2 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>98.5%</h2>
             <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Reliability</p>
         </div>
         <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
             <div style={{ color: '#f59e0b', display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><Star size={28} fill="#f59e0b" /></div>
             <h2 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>4.9</h2>
             <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Rating</p>
         </div>
      </div>

      <div className="card" style={{ marginBottom: '25px' }}>
         <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 15px 0', color: '#0f172a' }}><Navigation2 size={20} color="#10b981"/> Transport Method</h3>
         <div style={{ display: 'flex', gap: '15px' }}>
             <div style={{ flex: 1, border: '2px solid #3b82f6', background: '#eff6ff', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                 <Footprints size={24} color="#3b82f6" style={{ margin: '0 auto 10px auto' }} />
                 <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Walking</div>
                 <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Active</div>
             </div>
         </div>
      </div>

      <div className="card">
         <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 15px 0', color: '#0f172a' }}><CheckCircle size={20} color="#3b82f6"/> Campus Feedback</h3>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <div style={{ paddingBottom: '15px', borderBottom: '1px solid #e2e8f0' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                     <span style={{ display: 'flex', color: '#fbbf24' }}><Star size={14} fill="#fbbf24"/><Star size={14} fill="#fbbf24"/><Star size={14} fill="#fbbf24"/><Star size={14} fill="#fbbf24"/><Star size={14} fill="#fbbf24"/></span>
                     <span style={{ color: '#64748b', fontSize: '12px' }}>Student Rep</span>
                 </div>
                 <p style={{ margin: 0, color: '#334155', fontStyle: 'italic' }}>"Clutched the delivery before my calculus exam started. Absolute legend."</p>
             </div>
         </div>
      </div>
    </div>
  );
}

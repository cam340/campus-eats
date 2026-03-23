import React, { useState } from 'react';
import { api } from '../api';
import { useToast } from './Toast';

export default function Auth({ intendedRole, onCancel, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hostelName, setHostelName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let data;
      if (isLogin) {
        data = await api.auth.login({ email, password });
      } else {
        data = await api.auth.signup({
          email,
          password,
          full_name: fullName,
          phone_number: phoneNumber,
          hostel_name: hostelName,
          room_number: roomNumber,
          role: intendedRole
        });
      }
      
      localStorage.setItem('campus_user', JSON.stringify(data));
      toast(isLogin ? `Welcome back, ${data.full_name || data.name || 'User'}! 🎉` : 'Account created successfully! Welcome aboard! 🎉', 'success');
      onLoginSuccess(data);

    } catch (error) {
      toast(error.message || 'Authentication failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '1.25rem 1.5rem', border: '2px solid transparent',
    background: '#F9FAFB', borderRadius: '16px', fontSize: '1.1rem',
    outline: 'none', transition: 'all 0.2s', fontWeight: 600,
    fontFamily: 'inherit', boxSizing: 'border-box'
  };

  const handleFocus = (e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#10B981'; };
  const handleBlur = (e) => { e.target.style.background = '#F9FAFB'; e.target.style.borderColor = 'transparent'; };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)' }}>
      <div style={{ background: 'white', padding: '3.5rem', borderRadius: '40px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.4)', animation: 'slideUpFade 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards', margin: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 900, color: '#111827', letterSpacing: '-1px' }}>
              {isLogin ? 'Welcome Back' : `Join as ${intendedRole}`}
            </h2>
            <p style={{ margin: '0.5rem 0 0', color: '#6B7280', fontWeight: 500 }}>
              {isLogin ? 'Log in to continue your session.' : 'Create your secure account instantly.'}
            </p>
          </div>
          <button onClick={onCancel} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '48px', height: '48px', fontSize: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontWeight: 800, flexShrink: 0 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!isLogin && (
            <>
              <div>
                <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem', color: '#111827', fontSize: '1.1rem' }}>Full Name</label>
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} placeholder="e.g. John Doe" />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem', color: '#111827', fontSize: '1.1rem' }}>Phone Number</label>
                <input type="tel" required value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} placeholder="e.g. 08012345678" />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem', color: '#111827', fontSize: '1.1rem' }}>Hostel Name</label>
                  <input type="text" required value={hostelName} onChange={e => setHostelName(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} placeholder="e.g. Joseph Hall" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem', color: '#111827', fontSize: '1.1rem' }}>Room No.</label>
                  <input type="text" required value={roomNumber} onChange={e => setRoomNumber(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} placeholder="e.g. B204" />
                </div>
              </div>
            </>
          )}
          <div>
            <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem', color: '#111827', fontSize: '1.1rem' }}>Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} placeholder="your@email.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem', color: '#111827', fontSize: '1.1rem' }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} placeholder="••••••••" />
          </div>
          
          <button type="submit" disabled={loading} style={{ background: '#004F32', color: 'white', border: 'none', padding: '1.5rem', borderRadius: '99px', fontSize: '1.2rem', fontWeight: 900, cursor: 'pointer', marginTop: '1.5rem', transition: 'all 0.3s', boxShadow: '0 10px 25px -5px rgba(0,79,50,0.4)', fontFamily: 'inherit' }}
            onMouseOver={(e) => {e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.background='#10B981'; e.currentTarget.style.color='#004F32'}}
            onMouseOut={(e) => {e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.background='#004F32'; e.currentTarget.style.color='white'}}>
             {loading ? 'Processing...' : (isLogin ? 'Authenticate ➔' : 'Create Secure Account ➔')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2.5rem', fontWeight: 700, color: '#6B7280', fontSize: '1.1rem' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#004F32', cursor: 'pointer', display: 'inline-block', borderBottom: '2px solid #004F32' }}>
            {isLogin ? 'Sign up instantly' : 'Log in here'}
          </span>
        </p>
      </div>
    </div>
  );
}

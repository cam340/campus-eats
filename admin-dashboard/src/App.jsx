import React, { useState, useEffect } from 'react';
import LocationManager from './components/LocationManager';
import DashboardStats from './components/DashboardStats';
import UsersManager from './components/UsersManager';
import RequestsManager from './components/RequestsManager';
import Profile from './components/Profile';
import { ToastProvider } from './components/Toast';

const GlobalStyles = () => (
  <style>{`
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
      100% { transform: translateY(0px); }
    }
    @keyframes floatReverse {
      0% { transform: translateY(0px); }
      50% { transform: translateY(15px); }
      100% { transform: translateY(0px); }
    }
    @keyframes fadeInSlideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulseSoft {
      0% { box-shadow: 0 0 0 0 rgba(251, 146, 60, 0.4); }
      70% { box-shadow: 0 0 0 15px rgba(251, 146, 60, 0); }
      100% { box-shadow: 0 0 0 0 rgba(251, 146, 60, 0); }
    }
    .landing-container {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #ffffff;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }
    .bg-blob-green {
      position: absolute;
      top: -20%;
      left: -10%;
      width: 60vw;
      height: 60vw;
      background: radial-gradient(circle, rgba(5,150,105,0.06) 0%, rgba(255,255,255,0) 70%);
      border-radius: 50%;
      animation: float 8s ease-in-out infinite;
      z-index: 0;
    }
    .bg-blob-orange {
      position: absolute;
      bottom: -10%;
      right: -10%;
      width: 50vw;
      height: 50vw;
      background: radial-gradient(circle, rgba(251,146,60,0.12) 0%, rgba(255,255,255,0) 70%);
      border-radius: 50%;
      animation: floatReverse 6s ease-in-out infinite;
      z-index: 0;
    }
    .hero-card {
      position: relative;
      z-index: 10;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(5, 150, 105, 0.15);
      border: 1px solid rgba(5, 150, 105, 0.1);
      display: flex;
      flex-direction: row;
      max-width: 1000px;
      width: 90%;
      animation: fadeInSlideUp 1s ease-out forwards;
    }
    .hero-image {
      width: 50%;
      object-fit: cover;
    }
    .hero-content {
      width: 50%;
      padding: 4rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .hero-title {
      font-size: 3.5rem;
      font-weight: 900;
      color: #059669; /* Bold Green */
      margin: 0 0 1rem 0;
      line-height: 1.1;
      letter-spacing: -1px;
    }
    .hero-title span {
      color: #fb923c; /* Light Orange */
    }
    .hero-subtitle {
      color: #64748b;
      font-size: 1.125rem;
      margin-bottom: 2.5rem;
      line-height: 1.6;
    }
    .btn-enter {
      background: #059669;
      color: white;
      border: none;
      padding: 1rem 2.5rem;
      font-size: 1.125rem;
      font-weight: bold;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.3s ease;
      align-self: flex-start;
      animation: pulseSoft 2s infinite;
      box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
    }
    .btn-enter:hover {
      background: #047857;
      transform: translateY(-2px);
    }
    
    @media (max-width: 768px) {
      .hero-card {
        flex-direction: column;
      }
      .hero-image {
        width: 100%;
        height: 250px;
      }
      .hero-content {
        width: 100%;
        padding: 2rem;
      }
      .hero-title { font-size: 2.5rem; }
    }

    /* Layout styling for inside the dashboard */
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
      animation: fadeInSlideUp 0.5s ease-out forwards;
    }
    .sidebar {
      width: 260px;
      background: #059669; /* Bold Green */
      color: white;
      padding: 2rem;
      box-shadow: 4px 0 15px rgba(0,0,0,0.05);
    }
    .sidebar-title {
      color: #ffffff;
      font-weight: 900;
      font-size: 1.5rem;
      margin: 0;
    }
    .sidebar-title span {
      color: #fb923c; /* Light orange for contrast */
    }
    .sidebar-nav {
      margin-top: 3rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .nav-btn {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.8);
      padding: 1rem;
      text-align: left;
      border-radius: 0.5rem;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .nav-btn:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    .nav-btn.active {
      background: white;
      color: #059669;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .main-area {
      flex: 1;
      padding: 3rem;
      background: #f8fafc;
      overflow-y: auto;
    }
  `}</style>
);

export default function App() {
  const [entered, setEntered] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('campus_user');
    if (saved) {
      setUser(JSON.parse(saved));
      setEntered(true);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('campus_user');
    setUser(null);
    setEntered(false);
  };

  if (!entered) {
    return (
      <ToastProvider>
        <div className="landing-container">
          <GlobalStyles />
          <div className="bg-blob-green" />
          <div className="bg-blob-orange" />
          
          <div className="hero-card">
            <img src="/hero.png" alt="Fresh Food" className="hero-image" />
            <div className="hero-content">
              <h1 className="hero-title">Campus<span>Eats</span> Admin</h1>
              <p className="hero-subtitle">
                Manage the university's food delivery ecosystem with precision. 
                Monitor real-time analytics, configure drop-off zones, and oversee rider fleets dynamically.
              </p>
              <button className="btn-enter" onClick={() => setEntered(true)}>
                Enter Portal
              </button>
            </div>
          </div>
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="dashboard-layout">
        <GlobalStyles />
        <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="sidebar-title" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('stats')}>
            Campus<span>Eats</span>
          </h2>
          <nav className="sidebar-nav" style={{ flex: 1 }}>
            <button 
              onClick={() => setActiveTab('stats')} 
              className={`nav-btn ${activeTab === 'stats' ? 'active' : ''}`}
            >
              Analytics Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('locations')} 
              className={`nav-btn ${activeTab === 'locations' ? 'active' : ''}`}
            >
              Delivery Locations
            </button>
            <button 
              onClick={() => setActiveTab('users')} 
              className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            >
              User Verification
            </button>
            <button 
              onClick={() => setActiveTab('requests')} 
              className={`nav-btn ${activeTab === 'requests' ? 'active' : ''}`}
            >
              Live Requests Queue
            </button>
            <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <button 
                onClick={() => setActiveTab('profile')} 
                className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                style={{ width: '100%' }}
              >
                👤 My Profile
              </button>
            </div>
          </nav>
          <button onClick={logout} className="nav-btn" style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.2)' }}>
            Log Out
          </button>
        </aside>
        <main className="main-area">
          {activeTab === 'stats' && <DashboardStats />}
          {activeTab === 'locations' && <LocationManager />}
          {activeTab === 'users' && <UsersManager />}
          {activeTab === 'requests' && <RequestsManager />}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '800px' }}>
              <Profile userId={user?.id || 'admin_test'} role="admin" onClose={() => setActiveTab('stats')} />
            </div>
          )}
        </main>
      </div>
    </ToastProvider>
  );
}

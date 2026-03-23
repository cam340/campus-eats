import React, { useState, useEffect } from 'react';
import StudentDashboard from './components/StudentDashboard';
import RiderDashboard from './components/RiderDashboard';
import Chat from './components/Chat';
import Auth from './components/Auth';
import Profile from './components/Profile';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

const GlobalStyles = () => (
  <style>
    {`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #111827;
      background-color: #F9FAFB;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    
    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(50px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes scrollMarquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    @keyframes float1 {
      0%, 100% { transform: translateY(0) rotate(-10deg); }
      50% { transform: translateY(-30px) rotate(10deg); }
    }

    @keyframes float2 {
      0%, 100% { transform: translateY(0) rotate(5deg) scale(1); }
      50% { transform: translateY(-20px) rotate(-15deg) scale(1.1); }
    }
    
    @keyframes float3 {
      0%, 100% { transform: translateY(0) rotate(15deg); }
      50% { transform: translateY(-40px) rotate(-5deg); }
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    
    .chow-btn-primary {
      background-color: #004F32;
      color: white;
      border: none;
      padding: 1.125rem 2.5rem;
      border-radius: 9999px;
      font-weight: 800;
      font-size: 1.125rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
      box-shadow: 0 10px 25px -5px rgba(0, 79, 50, 0.4);
    }
    .chow-btn-primary:hover {
      background-color: #003e27;
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 15px 35px -5px rgba(0, 79, 50, 0.5);
    }
    
    .chow-btn-secondary {
      background-color: white;
      color: #004F32;
      border: none;
      padding: 1.125rem 2.5rem;
      border-radius: 9999px;
      font-weight: 800;
      font-size: 1.125rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
      box-shadow: 0 10px 25px -5px rgba(255, 255, 255, 0.2);
    }
    .chow-btn-secondary:hover {
      background-color: #F3F4F6;
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 15px 35px -5px rgba(255, 255, 255, 0.3);
    }
    
    .chow-nav-link {
      background: transparent;
      border: none;
      font-weight: 700;
      color: #4B5563;
      cursor: pointer;
      font-family: inherit;
      font-size: 1.05rem;
      transition: color 0.2s;
    }
    .chow-nav-link:hover {
      color: #004F32;
    }
    
    .floating-emoji {
      position: absolute;
      font-size: 4.5rem;
      filter: drop-shadow(0 20px 25px rgba(0,0,0,0.4));
      z-index: 10;
    }
    
    .marquee-container {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 200%;
      display: flex;
      padding: 1.25rem 0;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(12px);
      border-top: 1px solid rgba(255,255,255,0.05);
      z-index: 5;
    }
    
    .marquee-content {
      display: flex;
      gap: 4rem;
      white-space: nowrap;
      animation: scrollMarquee 35s linear infinite;
      color: #A7F3D0;
      font-weight: 700;
      font-size: 1.25rem;
      letter-spacing: 0.5px;
    }

    /* Dashboard Layout */
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
      background: #F9FAFB;
    }
    .sidebar {
      width: 300px;
      background: white;
      border-right: 1px solid #E5E7EB;
      padding: 2.5rem 2rem;
      display: flex;
      flex-direction: column;
    }
    .sidebar-title {
      color: #004F32;
      font-weight: 900;
      font-size: 2rem;
      margin: 0;
      letter-spacing: -1.5px;
    }
    .sidebar-nav {
      margin-top: 3rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex: 1;
    }
    .nav-btn {
      background: transparent;
      border: none;
      color: #6B7280;
      padding: 1.25rem 1.5rem;
      text-align: left;
      border-radius: 16px;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: 700;
      transition: all 0.2s;
      font-family: inherit;
    }
    .nav-btn:hover {
      background: #F3F4F6;
      color: #111827;
    }
    .nav-btn.active {
      background: #004F32;
      color: white;
      box-shadow: 0 10px 20px -5px rgba(0, 79, 50, 0.3);
    }
    .main-area {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    /* ===== MOBILE RESPONSIVE OVERRIDES ===== */
    @media (max-width: 900px) {
      .landing-hero-row {
        flex-direction: column !important;
        gap: 2.5rem !important;
        text-align: center;
      }
      .landing-hero-text h1 {
        font-size: 2.75rem !important;
        letter-spacing: -1px !important;
      }
      .landing-hero-text p {
        font-size: 1.1rem !important;
        margin-left: auto;
        margin-right: auto;
      }
      .landing-hero-buttons {
        justify-content: center !important;
        flex-direction: column;
        width: 100%;
      }
      .chow-btn-primary, .chow-btn-secondary {
        width: 100% !important;
        padding: 1.25rem !important;
      }
      .landing-hero-image {
        max-width: 100% !important;
      }
      .landing-hero-image img {
        height: 350px !important;
      }
      
      .dashboard-layout {
        flex-direction: column;
      }
      .sidebar {
        width: 100% !important;
        border-right: none;
        border-bottom: 1px solid #E5E7EB;
        padding: 1.25rem !important;
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(255,255,255,0.8);
        backdrop-filter: blur(10px);
      }
      .sidebar-title {
        font-size: 1.5rem !important;
      }
      .sidebar-nav {
        flex-direction: row !important;
        margin-top: 1rem !important;
        gap: 0.5rem !important;
        overflow-x: auto;
        padding-bottom: 0.5rem;
      }
      .nav-btn {
        padding: 0.75rem 1rem !important;
        font-size: 0.9rem !important;
        white-space: nowrap;
      }
      .main-area {
        padding: 1.5rem 1rem !important;
      }

      .chat-floating {
        bottom: 0 !important;
        right: 0 !important;
        width: 100% !important;
        height: 100% !important;
        border-radius: 0 !important;
      }
      .profile-view-container {
        padding: 1.5rem 1rem !important;
      }
      .student-main-flex {
        flex-direction: column !important;
      }
      .student-order-sidebar {
        width: 100% !important;
        position: relative !important;
        top: auto !important;
      }
      .student-header-actions {
        flex-wrap: wrap;
        gap: 0.75rem !important;
      }
      .rider-grid {
        grid-template-columns: 1fr !important;
      }
    }


    @media (max-width: 480px) {
      .landing-hero-text h1 {
        font-size: 2.25rem !important;
      }
      .chow-btn-primary, .chow-btn-secondary {
        padding: 0.875rem 1.5rem;
        font-size: 1rem;
      }
      .cta-heading {
        font-size: 1.75rem !important;
      }
    }
    `}
  </style>
);

function StandardLandingPage({ onSelectRole }) {
  const marqueeText = "🛵 Delivery to Joseph Hall   •   🛵 Rider picking up from New Caf   •   🥤 Cold drinks headed to Esme Hall   •   🍛 Jollof rice and fish on its way to Levi Hall   •   ";

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
       <GlobalStyles />
       
       {/* NAV */}
       <header style={{ padding: '1.25rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#004F32', letterSpacing: '-1.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#10B981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004F32', fontSize: '1.2rem' }}>✦</div>
            CampusEats
          </div>
          <nav className="landing-nav-links" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
             <button className="chow-nav-link" onClick={() => onSelectRole('rider')}>Earn as a Rider</button>
             <button className="chow-nav-link" onClick={() => onSelectRole('student')}>Log In</button>
             <button className="chow-btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', boxShadow: '0 8px 20px -5px rgba(0,79,50,0.3)' }} onClick={() => onSelectRole('student')}>
               Order Now
             </button>
          </nav>
          {/* Mobile hamburger */}
          <button className="mobile-menu-btn" style={{ display: 'none', background: '#004F32', color: 'white', border: 'none', borderRadius: '12px', padding: '0.5rem 1rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => onSelectRole('student')}>
            Order ➔
          </button>
       </header>

       <main>
          {/* HERO SECTION */}
          <section style={{ padding: '4rem 5% 10rem 5%', backgroundColor: '#004F32', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', minHeight: '80vh' }}>
            <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

            <div className="floating-emoji" style={{ top: '15%', left: '42%', animation: 'float1 6s infinite' }}>🍔</div>
            <div className="floating-emoji" style={{ bottom: '30%', right: '2%', animation: 'float2 7s infinite', zIndex: 20 }}>🛵</div>
            <div className="floating-emoji" style={{ top: '10%', right: '35%', animation: 'float3 5s infinite' }}>🥤</div>
            <div className="floating-emoji" style={{ bottom: '45%', left: '45%', animation: 'float2 6.5s infinite', fontSize: '3.5rem' }}>🍟</div>

            <div className="landing-hero-row" style={{ maxWidth: '1250px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5rem', zIndex: 10 }}>
              <div className="landing-hero-text" style={{ flex: 1.1, animation: 'slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
                 <div style={{ display: 'inline-block', backgroundColor: 'rgba(16,185,129,0.2)', color: '#A7F3D0', padding: '0.5rem 1rem', borderRadius: '99px', fontWeight: 800, fontSize: '0.9rem', marginBottom: '1.5rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                   ⚡ Unbeatable Campus Delivery
                 </div>
                 <h1 style={{ fontSize: '5.5rem', fontWeight: 900, lineHeight: 1.05, marginBottom: '2rem', letterSpacing: '-3px', color: '#ffffff' }}>
                   Happiness <br/><span style={{ color: '#10B981' }}>delivered</span> to your dorm.
                 </h1>
                 <p style={{ fontSize: '1.35rem', color: '#D1FAE5', marginBottom: '3.5rem', lineHeight: 1.6, maxWidth: '500px', fontWeight: 500 }}>
                   Enjoy quick and affordable deliveries from New cafeteria and Old cafeteria directly to your exact location on campus.
                 </p>
                 <div className="landing-hero-buttons" style={{ display: 'flex', gap: '1.5rem' }}>
                    <button className="chow-btn-primary" style={{ backgroundColor: '#10B981', color: '#004F32', fontSize: '1.25rem', padding: '1.25rem 2.5rem' }} onClick={() => onSelectRole('student')}>
                      Start Ordering
                    </button>
                    <button className="chow-btn-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => onSelectRole('rider')}>
                      Become a Rider
                    </button>
                 </div>
              </div>
              
              <div className="landing-hero-image" style={{ flex: 0.9, position: 'relative', animation: 'slideUpFade 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
                 <div style={{ position: 'relative', borderRadius: '40px', padding: '1rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <img 
                      src="/hero.png" 
                      alt="Delicious Food" 
                      style={{ 
                        width: '100%', 
                        height: '550px',
                        objectFit: 'cover',
                        borderRadius: '32px', 
                        boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6)',
                      }} 
                    />
                 </div>
              </div>
            </div>
            <div className="marquee-container"><div className="marquee-content">{marqueeText} {marqueeText} {marqueeText} {marqueeText}</div></div>
          </section>

          {/* HOW IT WORKS */}
          <section style={{ padding: '6rem 5%', backgroundColor: '#ffffff', position: 'relative' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ display: 'inline-block', backgroundColor: '#E6F5ED', color: '#004F32', padding: '0.5rem 1.25rem', borderRadius: '99px', fontWeight: 800, fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                How It Works
              </div>
              <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#111827', marginBottom: '1rem', letterSpacing: '-2px', lineHeight: 1.1 }}>
                Three steps to <span style={{ color: '#10B981' }}>deliciousness</span>
              </h2>
              <p style={{ color: '#6B7280', fontSize: '1.25rem', fontWeight: 500, maxWidth: '600px', margin: '0 auto 4rem', lineHeight: 1.6 }}>
                Getting food delivered to your dorm has never been easier. Here's how CampusEats works:
              </p>
              
              <div className="how-it-works-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem', textAlign: 'left' }}>
                {[
                  { step: '01', emoji: '📝', title: 'Drop a Request', desc: 'Tell us exactly what you want from Old or New Caf. Add as many items as you like — be specific!' },
                  { step: '02', emoji: '🛵', title: 'Rider Accepts', desc: 'A nearby campus rider picks up your order within minutes and heads to the cafeteria.' },
                  { step: '03', emoji: '🎉', title: 'Enjoy Your Meal', desc: 'Track your rider in real-time via live chat. Food arrives at your dorm door — hot and fresh!' },
                ].map(item => (
                  <div key={item.step} style={{ background: '#F9FAFB', padding: '3rem 2.5rem', borderRadius: '32px', border: '1px solid #E5E7EB', transition: 'all 0.3s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <span style={{ fontSize: '2.5rem' }}>{item.emoji}</span>
                      <span style={{ color: '#10B981', fontWeight: 900, fontSize: '1rem', letterSpacing: '1px' }}>STEP {item.step}</span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111827', margin: '0 0 1rem', letterSpacing: '-0.5px' }}>{item.title}</h3>
                    <p style={{ color: '#6B7280', fontSize: '1.1rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* STATS STRIP */}
          <section style={{ padding: '4rem 5%', backgroundColor: '#111827' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem', textAlign: 'center' }}>
              {[
                { number: '500+', label: 'Orders Delivered' },
                { number: '4', label: 'Campus Zones' },
                { number: '2', label: 'Cafeterias Connected' },
                { number: '<10min', label: 'Average Delivery' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: '#10B981', letterSpacing: '-1px' }}>{s.number}</div>
                  <div style={{ color: '#9CA3AF', fontWeight: 700, fontSize: '1rem', marginTop: '0.5rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section style={{ padding: '8rem 5%', backgroundColor: '#004F32', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2310B981\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
            <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
              <h2 className="cta-heading" style={{ fontSize: '4.5rem', fontWeight: 900, color: 'white', marginBottom: '1.5rem', letterSpacing: '-2px', lineHeight: 1.1 }}>
                Ready to conquer your cravings?
              </h2>
              <p style={{ color: '#A7F3D0', fontSize: '1.25rem', fontWeight: 500, marginBottom: '3rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
                Join hundreds of students already enjoying effortless campus food delivery.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                 <button className="chow-btn-primary" style={{ backgroundColor: '#10B981', color: '#004F32', padding: '1.5rem 4rem', fontSize: '1.35rem', boxShadow: '0 15px 30px -5px rgba(16,185,129,0.4)' }} onClick={() => onSelectRole('student')}>
                   Order your next meal
                 </button>
                 <button className="chow-btn-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', padding: '1.5rem 3rem', fontSize: '1.2rem' }} onClick={() => onSelectRole('rider')}>
                   Start Earning
                 </button>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{ padding: '3rem 5%', backgroundColor: '#111827', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ width: '24px', height: '24px', backgroundColor: '#10B981', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004F32', fontSize: '0.8rem', fontWeight: 900 }}>✦</div>
              <span style={{ color: 'white', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-1px' }}>CampusEats</span>
            </div>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>
              © 2026 CampusEats by EMMA-PRAISE LIMITED. All rights reserved.
            </p>
          </footer>
       </main>
    </div>
  );
}

export default function App() {
  const [sessionUser, setSessionUser] = useState(null);
  const [authRoleSelection, setAuthRoleSelection] = useState(null); 
  const [activeTab, setActiveTab] = useState('main'); 
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('campus_user');
    if (savedUser) {
        setSessionUser(JSON.parse(savedUser));
    }
  }, []);

  const handleOpenChat = (id) => {
    setChatId(id);
    setActiveTab('chat');
  };

  const logout = () => {
    localStorage.removeItem('campus_user');
    setSessionUser(null);
  };

  if (!sessionUser) {
    return (
      <ToastProvider>
        <StandardLandingPage onSelectRole={(role) => setAuthRoleSelection(role)} />
        {authRoleSelection && 
           <Auth 
             intendedRole={authRoleSelection} 
             onCancel={() => setAuthRoleSelection(null)} 
             onLoginSuccess={(user) => {
                 setSessionUser(user);
                 setAuthRoleSelection(null);
             }}
           />
        }
      </ToastProvider>
    );
  }

  const activeUserRole = sessionUser.role || 'student';
  const activeUserId = sessionUser.id;

  if (activeUserRole === 'student') {
    return (
      <ToastProvider>
        <div style={{ 
          position: 'relative', 
          minHeight: '100vh', 
          background: '#F9FAFB',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: activeTab === 'profile' ? 'center' : 'flex-start'
        }}>
          <GlobalStyles />
          {activeTab === 'profile' ? (
            <div className="profile-view-container" style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>
              <Profile userId={activeUserId} role="student" onClose={() => setActiveTab('main')} />
            </div>
          ) : (
            <ErrorBoundary>
              <StudentDashboard userId={activeUserId} onLogout={logout} onOpenChat={handleOpenChat} onOpenProfile={() => setActiveTab('profile')} />
            </ErrorBoundary>
          )}
          {activeTab === 'chat' && (
            <div className="chat-floating" style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: '450px', zIndex: 1000, animation: 'slideUpFade 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
               <Chat userId={activeUserId} role="student" requestId={chatId} onClose={() => setActiveTab('main')} />
            </div>
          )}
        </div>
      </ToastProvider>
    );
  }

  const DashboardLayout = ({ title, navItems, children }) => (
    <div className="dashboard-layout">
      <GlobalStyles />
      <aside className="sidebar">
        <div>
          <h2 className="sidebar-title" style={{cursor: 'pointer'}}>CampusEats</h2>
          <p style={{color:'#9CA3AF', marginTop:'0.75rem', marginBottom:'0', fontWeight:'800', fontSize:'0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px'}}>{title} PORTAL</p>
        </div>
        <nav className="sidebar-nav">
          {navItems}
          <div style={{flex: 1}}></div>
          <button onClick={logout} style={{background:'#F3F4F6', border:'none', padding:'1.125rem 1.5rem', color:'#4B5563', borderRadius:'16px', cursor:'pointer', fontWeight:'800', textAlign:'left', fontSize: '1.1rem', transition: 'all 0.2s'}}>
            Log Out
          </button>
        </nav>
      </aside>
      <main className="main-area">
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }}>
           {children}
        </div>
      </main>
    </div>
  );

  if (activeUserRole === 'rider') {
    return (
      <ToastProvider>
        <DashboardLayout title="Rider" navItems={
          <>
            <button onClick={() => {setChatId(null); setActiveTab('main')}} className={`nav-btn ${activeTab === 'main' ? 'active' : ''}`}>Live Deliveries</button>
            <button onClick={() => setActiveTab('profile')} className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}>My Profile</button>
            {activeTab === 'chat' && <button className="nav-btn active">Live Chat</button>}
          </>
        }>
          {activeTab === 'main' && <ErrorBoundary><RiderDashboard userId={activeUserId} onOpenChat={handleOpenChat} /></ErrorBoundary>}
          {activeTab === 'profile' && <Profile userId={activeUserId} role="rider" onClose={() => setActiveTab('main')} />}
          {activeTab === 'chat' && <Chat userId={activeUserId} role="rider" requestId={chatId} onClose={() => setActiveTab('main')} />}
        </DashboardLayout>
      </ToastProvider>
    );
  }
}

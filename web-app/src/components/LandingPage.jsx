import React, { useState, useEffect } from 'react';
import { ArrowRight, Package, Clock, ShieldCheck, MapPin, Zap, Star } from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  const [isExiting, setIsExiting] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStart = (role = 'student') => {
      setIsExiting(true);
      setTimeout(() => onGetStarted(role), 600);
  };

  return (
    <div className={isExiting ? 'animate-exit' : ''} style={{ minHeight: '100vh', background: '#f0fdf4', color: '#064e3b', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>
      <style>
        {`
          @keyframes slideDownFade {
            from { transform: translateY(-30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slideUpFade {
            from { transform: translateY(40px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slideInRight {
            from { transform: translateX(50px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes pulseSoft {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
            50% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
          @keyframes floatY {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }
          @keyframes floatX {
            0% { transform: translateX(0px) rotate(0deg); }
            50% { transform: translateX(10px) rotate(2deg); }
            100% { transform: translateX(0px) rotate(0deg); }
          }
          @keyframes blobShape {
            0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: scale(1) translate(0px, 0px); }
            50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: scale(1.05) translate(20px, -20px); }
            100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: scale(1) translate(0px, 0px); }
          }
          @keyframes gradientRoll {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes exitScreen {
            0% { opacity: 1; transform: scale(1); filter: blur(0px); }
            100% { opacity: 0; transform: scale(1.05); filter: blur(10px); }
          }
          
          .animate-exit {
            animation: exitScreen 0.5s cubic-bezier(0.87, 0, 0.13, 1) forwards !important;
          }
          
          /* Staggered entry classes */
          .stagger-1 { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.1s; }
          .stagger-2 { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.2s; }
          .stagger-3 { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.3s; }
          .stagger-4 { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.4s; }
          
          .stagger-right { animation: slideInRight 1s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.3s; }
          
          .float-y { animation: floatY 5s ease-in-out infinite; }
          .float-x-slow { animation: floatX 8s ease-in-out infinite; }
          
          .pulse-btn { animation: pulseSoft 3s infinite; }
          .gradient-text {
            background: linear-gradient(90deg, #059669, #10b981, #3b82f6);
            background-size: 200% auto;
            color: transparent;
            -webkit-background-clip: text;
            animation: gradientRoll 4s linear infinite;
          }
          
          .glass-panel {
             background: rgba(255, 255, 255, 0.7);
             backdrop-filter: blur(20px);
             -webkit-backdrop-filter: blur(20px);
             border: 1px solid rgba(255, 255, 255, 0.8);
             box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
          }
          
          .hover-lift { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
          .hover-lift:hover {
             transform: translateY(-12px) scale(1.03);
             box-shadow: 0 30px 60px -15px rgba(16, 185, 129, 0.2);
          }

          .blob-background {
            position: absolute;
            width: 600px;
            height: 600px;
            background: linear-gradient(135deg, #34d399, #10b981, #059669);
            filter: blur(80px);
            opacity: 0.3;
            z-index: 0;
            animation: blobShape 15s infinite alternate;
          }
          
          .hero-grid {
             display: grid;
             grid-template-columns: 1fr 1fr;
             gap: 60px;
             align-items: center;
             max-width: 1300px;
             margin: 0 auto;
             position: relative;
             z-index: 10;
          }
          
          @media (max-width: 900px) {
             .hero-grid { grid-template-columns: 1fr; text-align: center; }
             .hero-btns { justify-content: center; }
             .blob-background { width: 300px; height: 300px; }
          }
          
          * { box-sizing: border-box; }
        `}
      </style>

      {/* ── Floating Background Blobs ── */}
      <div className="blob-background" style={{ top: '-100px', left: '-100px' }}></div>
      <div className="blob-background" style={{ bottom: '100px', right: '-200px', background: 'linear-gradient(135deg, #6ee7b7, #3b82f6)', animationDelay: '-5s' }}></div>

      {/* ── Navbar ── */}
      <nav style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 5%', 
          background: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'transparent', 
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none', 
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.5)' : '1px solid transparent',
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '900', fontSize: '1.6rem', color: '#064e3b', letterSpacing: '-0.5px' }}>
          <div className="float-y" style={{ background: '#10b981', color: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 8px 15px -3px rgba(16, 185, 129, 0.4)' }}>
              <Zap size={24} fill="white" />
          </div>
          Campus <span style={{ color: '#10b981' }}>Eats</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={() => handleStart('student')} style={{ 
              background: scrolled ? '#064e3b' : 'white', 
              color: scrolled ? 'white' : '#064e3b', 
              border: scrolled ? 'none' : '2px solid rgba(16, 185, 129, 0.2)', 
              padding: '10px 28px', borderRadius: '30px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s', 
              boxShadow: scrolled ? '0 10px 25px -5px rgba(6, 78, 59, 0.3)' : '0 4px 6px -1px rgba(0,0,0,0.05)' 
          }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
            Sign In
          </button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header style={{ paddingTop: '160px', paddingBottom: '100px', paddingLeft: '5%', paddingRight: '5%', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-grid">
           <div>
               <div className="stagger-1 glass-panel" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', color: '#047857', borderRadius: '30px', fontSize: '13px', fontWeight: '800', marginBottom: '32px', letterSpacing: '0.5px' }}>
                   <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></span>
                   THE #1 PEER-TO-PEER DELIVERY NETWORK
               </div>
               
               <h1 className="stagger-2" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: '900', margin: '0 0 24px', lineHeight: '1.1', letterSpacing: '-1.5px', color: '#022c22' }}>
                   Anything you need.<br/>
                   Delivered in <span className="gradient-text">minutes.</span>
               </h1>
               
               <p className="stagger-3" style={{ fontSize: '1.25rem', color: '#475569', margin: '0 0 48px', lineHeight: '1.6', maxWidth: '500px' }}>
                   Tied up studying? Request a fellow student to grab your food, laundry, or books. Or become a rider, earn Favor Points, and make money between classes.
               </p>
               
               <div className="stagger-4 hero-btns" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                   <button onClick={() => handleStart('student')} className="pulse-btn hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#10b981', color: 'white', border: 'none', padding: '18px 36px', borderRadius: '40px', fontSize: '1.15rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s' }}>
                       Get Started <ArrowRight size={22} />
                   </button>
                   <button onClick={() => handleStart('rider')} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#064e3b', padding: '16px 36px', borderRadius: '40px', fontSize: '1.15rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.95)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.7)'}>
                       Become a Rider
                   </button>
               </div>
               
               {/* Social Proof */}
               <div className="stagger-4" style={{ marginTop: '50px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <div style={{ display: 'flex' }}>
                       {[1,2,3,4].map(i => (
                           <div key={i} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#d1fae5', border: '3px solid white', marginLeft: i > 1 ? '-15px' : '0', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5-i }}>
                               <Star size={18} color="#10b981" fill="#10b981" />
                           </div>
                       ))}
                   </div>
                   <p style={{ margin: 0, fontSize: '14px', color: '#475569', fontWeight: '600' }}>Trusted by 10,000+ students daily.</p>
               </div>
           </div>
           
           <div className="stagger-right" style={{ position: 'relative' }}>
               {/* Decorative Ring */}
               <div className="float-x-slow" style={{ position: 'absolute', inset: '-30px', border: '2px dashed rgba(16, 185, 129, 0.3)', borderRadius: '40px', zIndex: 0 }}></div>
               
               <div className="glass-panel hover-lift" style={{ padding: '20px', borderRadius: '32px', position: 'relative', zIndex: 1 }}>
                   <img src="/hero-image.png" alt="Student delivering food on campus" style={{ width: '100%', height: 'auto', borderRadius: '20px', display: 'block', objectFit: 'cover', aspectRatio: '4/3' }} />
                   
                   {/* Floating Graphic 1 */}
                   <div className="float-y glass-panel" style={{ position: 'absolute', top: '10%', left: '-30px', padding: '16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '45px', height: '45px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Zap color="white" size={24} fill="white" /></div>
                       <div>
                           <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Delivery Time</p>
                           <p style={{ margin: 0, fontSize: '16px', color: '#022c22', fontWeight: '900' }}>12 Minutes 🔥</p>
                       </div>
                   </div>
                   
                   {/* Floating Graphic 2 */}
                   <div className="float-y class-panel" style={{ background: 'white', animationDelay: '2s', position: 'absolute', bottom: '-20px', right: '30px', padding: '16px 24px', borderRadius: '20px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '40px', height: '40px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><ShieldCheck color="#10b981" size={22} /></div>
                       <div>
                           <p style={{ margin: 0, fontSize: '15px', color: '#022c22', fontWeight: '900' }}>Verified Rider</p>
                           <p style={{ margin: 0, fontSize: '13px', color: '#10b981', fontWeight: '700' }}>On their way!</p>
                       </div>
                   </div>
               </div>
           </div>
        </div>
      </header>

      {/* ── Features Section ── */}
      <section style={{ padding: '100px 5%', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                  <h2 className="gradient-text" style={{ fontSize: '3rem', fontWeight: '900', margin: '0 0 16px', letterSpacing: '-1px', display: 'inline-block' }}>Why Campus Eats?</h2>
                  <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>We reconstructed the traditional delivery model specifically for inner-campus ecosystems.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
                  <FeatureCard 
                      icon={<Clock size={32} color="#f59e0b" />} 
                      title="Point-to-Point Speed" 
                      desc="No cars, no traffic. Riders are classmates walking right past your favorite spots straight to you."
                      bg="linear-gradient(135deg, #fef3c7, #fde68a)"
                  />
                  <FeatureCard 
                      icon={<ShieldCheck size={32} color="#10b981" />} 
                      title="100% Student Verified" 
                      desc="Only verified university students can sign up to ride. Total transparency and built-in trust."
                      bg="linear-gradient(135deg, #dcfce7, #a7f3d0)"
                  />
                  <FeatureCard 
                      icon={<MapPin size={32} color="#3b82f6" />} 
                      title="Hyper-Local Navigation" 
                      desc="Say goodbye to getting lost. Our riders know the specific names of every dorm block and hall."
                      bg="linear-gradient(135deg, #eff6ff, #bfdbfe)"
                  />
              </div>
          </div>
      </section>

      {/* ── Immersive CTA Section ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 100px', padding: '0 5%', position: 'relative', zIndex: 10 }}>
          <div className="hover-lift" style={{ position: 'relative', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 30px 60px -15px rgba(16, 185, 129, 0.3)' }}>
              <img src="/campus-lifestyle.png" alt="Students eating together" style={{ width: '100%', height: '500px', objectFit: 'cover', display: 'block', transform: 'scale(1.05)' }} />
              
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(2, 44, 34, 0.95) 0%, rgba(16, 185, 129, 0.6) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)', maxWidth: '700px' }}>
                      <h2 style={{ fontSize: '3rem', fontWeight: '900', margin: '0 0 20px', letterSpacing: '-1px', color: 'white' }}>Unlock Campus Convenience.</h2>
                      <p style={{ fontSize: '1.25rem', color: '#ecfdf5', margin: '0 0 40px' }}>
                          Join the network today. Order what you need, when you need it, or sign up to deliver and start earning immediately.
                      </p>
                      <button onClick={() => handleStart('student')} className="pulse-btn" style={{ background: 'white', color: '#064e3b', border: 'none', padding: '20px 48px', borderRadius: '40px', fontSize: '1.25rem', fontWeight: '900', cursor: 'pointer', transition: 'transform 0.2s' }}>
                          Create Free Account
                      </button>
                  </div>
              </div>
          </div>
      </section>

      {/* ── Advanced Footer ── */}
      <footer style={{ padding: '60px 5%', background: '#022c22', color: '#a7f3d0', borderTop: '1px solid #064e3b' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '900', fontSize: '1.5rem', color: 'white' }}>
                  <div style={{ background: '#10b981', padding: '6px', borderRadius: '10px' }}><Package size={20} color="white" /></div>
                  Campus Eats
              </div>
              <p style={{ margin: 0, fontSize: '1rem', color: '#6ee7b7' }}>© {new Date().getFullYear()} Engineered exclusively for university ecosystems.</p>
          </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, bg }) {
    return (
        <div className="glass-panel hover-lift" style={{ padding: '40px 32px', borderRadius: '32px', cursor: 'default' }}>
            <div className="float-y" style={{ width: '70px', height: '70px', borderRadius: '24px', background: bg, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '32px', boxShadow: '0 10px 20px -10px rgba(0,0,0,0.1)' }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '0 0 16px', color: '#022c22', letterSpacing: '-0.5px' }}>{title}</h3>
            <p style={{ margin: 0, color: '#475569', lineHeight: '1.7', fontSize: '1.1rem' }}>{desc}</p>
        </div>
    );
}

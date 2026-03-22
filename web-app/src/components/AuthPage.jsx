import React, { useState } from 'react';
import { ArrowLeft, Package, UserCheck, Zap, Mail, Briefcase, GraduationCap, MapPin, Building } from 'lucide-react';

export default function AuthPage({ userType, onAuthSuccess, onBack }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form State
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [level, setLevel] = useState('');
    const [hostel, setHostel] = useState('');
    const [hostelNumber, setHostelNumber] = useState('');
    
    const isStudent = userType === 'student';
    
    // Aesthetic Configurations based on role
    const config = {
        primary: isStudent ? '#3b82f6' : '#10b981', // Blue vs Emerald
        primaryLight: isStudent ? '#eff6ff' : '#ecfdf5',
        primaryDark: isStudent ? '#1e40af' : '#047857',
        title: isStudent ? 'Student Portal' : 'Rider Network',
        subtitle: isStudent ? 'Get your campus essentials delivered.' : 'Earn Favor Points delivering on campus.',
        imgSrc: isStudent ? '/campus-lifestyle.png' : '/hero-image.png',
        icon: isStudent ? <Package size={32} color="#3b82f6" /> : <Zap size={32} color="#10b981" />
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return alert("Email required");
        
        setIsLoading(true);
        if (isRegistering) {
            if (!name || (!isStudent && (!department || !level || !hostel || !hostelNumber))) {
                setIsLoading(false);
                return alert("Please fill out all required profile details.");
            }
            const preferences = { department, level, hostel, hostelNumber, defaultDorm: `${hostel}, Room ${hostelNumber}`, is_verified: false, verification_status: 'unverified' };
            try {
                const res = await fetch('http://localhost:4000/api/register', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, role: userType, name, preferences })
                });
                if (!res.ok) throw new Error('Registration failed. Email might exist.');
                const newUser = await res.json();
                onAuthSuccess(newUser);
            } catch (err) {
                alert(err.message);
            }
        } else {
            try {
                const res = await fetch('http://localhost:4000/api/login', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, role: userType })
                });
                if (!res.ok) throw new Error('User not found. Try registering.');
                const existingUser = await res.json();
                onAuthSuccess(existingUser);
            } catch (err) {
                alert(err.message);
            }
        }
        setIsLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f8fafc' }}>
            {/* Left Side: Form Container */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10, background: 'white', borderRight: '1px solid #e2e8f0', boxShadow: '20px 0 25px -5px rgba(0,0,0,0.05)' }}>
                {/* Back Button */}
                <button onClick={onBack} style={{ position: 'absolute', top: '30px', left: '40px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '600', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#0f172a'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                    <ArrowLeft size={18} /> Back to Home
                </button>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '440px', width: '100%', margin: '0 auto', padding: '40px 20px' }}>
                    
                    <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: config.primaryLight, display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }}>
                            {config.icon}
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>{config.title}</h1>
                        <p style={{ color: '#64748b', margin: 0 }}>{config.subtitle}</p>
                    </div>

                    {/* Toggle Login/Signup */}
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '30px' }}>
                        <button onClick={() => setIsRegistering(false)} style={{ flex: 1, padding: '10px', border: 'none', background: !isRegistering ? 'white' : 'transparent', color: !isRegistering ? config.primary : '#64748b', fontWeight: !isRegistering ? 'bold' : '600', borderRadius: '8px', cursor: 'pointer', boxShadow: !isRegistering ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
                            Sign In
                        </button>
                        <button onClick={() => setIsRegistering(true)} style={{ flex: 1, padding: '10px', border: 'none', background: isRegistering ? 'white' : 'transparent', color: isRegistering ? config.primary : '#64748b', fontWeight: isRegistering ? 'bold' : '600', borderRadius: '8px', cursor: 'pointer', boxShadow: isRegistering ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
                            Create Account
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {isRegistering && (
                            <div className="input-group" style={{ position: 'relative' }}>
                                <label style={labelStyle}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <UserCheck size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                                    <input style={inputStyle} type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Jane Doe" />
                                </div>
                            </div>
                        )}

                        <div className="input-group" style={{ position: 'relative' }}>
                            <label style={labelStyle}>University Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                                <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="student@university.edu" />
                            </div>
                        </div>

                        {isRegistering && !isStudent && (
                            <div style={{ background: config.primaryLight, padding: '20px', borderRadius: '12px', marginTop: '10px', border: `1px solid ${config.primary}30` }}>
                                <p style={{ margin: '0 0 16px', fontSize: '13px', color: config.primaryDark, fontWeight: 'bold' }}>Rider Verification Profile</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={labelStyle}>Department</label>
                                        <input style={{...inputStyle, paddingLeft: '14px'}} type="text" value={department} onChange={e => setDepartment(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Level</label>
                                        <select style={{...inputStyle, paddingLeft: '14px', appearance: 'none'}} value={level} onChange={e => setLevel(e.target.value)} required>
                                            <option value="">Select</option><option value="100">100</option><option value="200">200</option><option value="300">300</option><option value="400">400</option><option value="500">500</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Hostel</label>
                                        <input style={{...inputStyle, paddingLeft: '14px'}} type="text" value={hostel} onChange={e => setHostel(e.target.value)} required placeholder="Block A" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Room</label>
                                        <input style={{...inputStyle, paddingLeft: '14px'}} type="text" value={hostelNumber} onChange={e => setHostelNumber(e.target.value)} required placeholder="12B" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} style={{ background: config.primary, color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: isLoading ? 'wait' : 'pointer', marginTop: '10px', boxShadow: `0 4px 14px 0 ${config.primary}60`, transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            {isLoading ? 'Processing...' : isRegistering ? `Join as ${isStudent ? 'Student' : 'Rider'}` : 'Sign In To Account'} 
                            {!isLoading && <ArrowRight size={20} />}
                        </button>
                    </form>

                </div>
            </div>

            {/* Right Side: Visual Context */}
            <div style={{ flex: '1.2', position: 'relative', overflow: 'hidden', display: 'none', '@media (min-width: 900px)': { display: 'block' } }}>
                <img src={config.imgSrc} alt="Campus Context" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${config.primaryDark}99, ${config.primary}bb)` }}></div>
                
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', color: 'white' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: '900', margin: '0 0 24px', letterSpacing: '-1px', lineHeight: '1.1' }}>
                            {isStudent ? 'Never go hungry during study sessions again.' : 'Turn your campus walks into real pocket money.'}
                        </h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '1.15rem' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ background: 'white', color: config.primary, padding: '4px', borderRadius: '50%' }}>✓</div> {isStudent ? 'Lightning fast delivery' : 'Flexible hours'}</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ background: 'white', color: config.primary, padding: '4px', borderRadius: '50%' }}>✓</div> {isStudent ? '100% verified student riders' : 'Deliver to friends and classmates'}</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ background: 'white', color: config.primary, padding: '4px', borderRadius: '50%' }}>✓</div> {isStudent ? 'Support your classmates' : 'Earn Favor Points instantly'}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#475569' };
const inputStyle = { width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', boxSizing: 'border-box', background: 'white', transition: 'border-color 0.2s' };

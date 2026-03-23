import React, { useState, useEffect } from 'react';
import { api, socket } from '../api';
import { useToast } from './Toast';

export default function StudentDashboard({ userId, onLogout, onOpenChat, onOpenProfile }) {
    const toast = useToast();
    const [locations, setLocations] = useState([]);
    const [requestText, setRequestText] = useState('');
    const [locationId, setLocationId] = useState('');
    const [cafeteria, setCafeteria] = useState('New Cafeteria');
    const [estimatedPrice, setEstimatedPrice] = useState('');
    const [budgetRange, setBudgetRange] = useState('Standard');
    const [activeRequest, setActiveRequest] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        console.log("StudentDashboard mounted for user:", userId);
        const fetchInitial = async () => {
            try {
                const locs = await api.locations.getAll();
                setLocations(locs || []);

                const reqs = await api.requests.getStudentActive(userId);
                if (reqs && reqs.length > 0) setActiveRequest(reqs[0]);

                const hist = await api.requests.getStudentHistory(userId);
                setHistory(hist || []);
            } catch (err) {
                console.error("Failed to fetch initial data:", err);
                toast("Connection error. Please refresh.", "error");
            }
        };
        fetchInitial();

        const handleRequestUpdated = (updatedReq) => {
            if (updatedReq.student_id === userId) {
                if (updatedReq.status === 'delivered') {
                    toast("Order Delivered! Enjoy your meal 🥘", "success");
                    setActiveRequest(null);
                    api.requests.getStudentHistory(userId).then(setHistory).catch(console.error);
                } else if (updatedReq.status === 'cancelled') {
                    toast("Order cancelled.", "info");
                    setActiveRequest(null);
                    api.requests.getStudentHistory(userId).then(setHistory).catch(console.error);
                } else {
                    setActiveRequest(updatedReq);
                }
            }
        };

        socket.on('request_updated', handleRequestUpdated);
        return () => {
            socket.off('request_updated', handleRequestUpdated);
        };
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (activeRequest) return toast('You already have an active order.', 'error');
        if (!locationId) return toast('Please select a delivery drop-off zone.', 'info');
        
        try {
            const newReq = await api.requests.create({
                student_id: userId,
                delivery_location_id: locationId,
                request_text: requestText,
                cafeteria: cafeteria,
                estimated_price: parseFloat(estimatedPrice || 0),
                budget_range: budgetRange
            });
            setActiveRequest(newReq);
            setRequestText('');
            setEstimatedPrice('');
        } catch (error) {
            toast('Error submitting request: ' + error.message, 'error');
        }
    };

    const getStatusText = (status) => {
        const statuses = {
            'request_sent': 'Looking for an available Rider...',
            'accepted': 'Rider Accepted! Heading to cafeteria.',
            'at_cafeteria': 'Rider is at the cafeteria picking up your order.',
            'on_way': 'Rider is on their way! Check your chat.',
            'delivered': 'Delivered! Enjoy your meal.'
        };
        return statuses[status] || status;
    };

    const handleCancel = async () => {
        if (!activeRequest) return;
        const confirmed = window.confirm('Are you sure you want to cancel this order?');
        if (!confirmed) return;
        try {
            await api.requests.cancel(activeRequest.id);
            toast('Order cancelled successfully.', 'info');
            setActiveRequest(null);
            const hist = await api.requests.getStudentHistory(userId);
            setHistory(hist || []);
        } catch (err) {
            toast('Failed to cancel: ' + err.message, 'error');
        }
    };

    return (
        <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            <style>
                {`
                @media (max-width: 768px) {
                    .student-top-header { padding: 0.75rem 4% !important; }
                    .student-top-header > div:first-child { font-size: 1.25rem !important; gap: 0.35rem !important; }
                    .student-top-header > div:first-child > div { width: 28px !important; height: 28px !important; font-size: 1rem !important; }
                    .student-header-actions { gap: 0.5rem !important; }
                    .location-pill { padding: 0.4rem 0.75rem !important; font-size: 0.85rem !important; }
                    .location-pill select { font-size: 0.85rem !important; }
                    .menu-btn { padding: 0.45rem 0.75rem !important; font-size: 0.95rem !important; border-radius: 10px !important; }
                    .menu-btn-label { display: none !important; }
                    .student-history-container { padding: 2rem 4% !important; }
                    .student-history-head { flex-direction: column !important; align-items: flex-start !important; gap: 1rem !important; }
                    .student-history-head h2 { font-size: 2rem !important; }
                    .student-history-head button { width: 100% !important; }
                    .student-history-card { flex-direction: column !important; align-items: flex-start !important; gap: 1.25rem !important; padding: 1.5rem !important; border-radius: 24px !important; }
                    .student-history-card-left { gap: 1rem !important; }
                    .student-history-card-right { width: 100%; display: flex; align-items: center; justify-content: space-between; text-align: left !important; }
                    .student-menu-dropdown { right: 4% !important; top: 55px !important; min-width: 200px !important; }
                }
                @media (max-width: 480px) {
                    .student-top-header > div:first-child { font-size: 1.1rem !important; }
                    .location-pill { max-width: 160px !important; }
                    .location-pill select { max-width: 100px !important; text-overflow: ellipsis !important; }
                }
                @keyframes menuSlideIn {
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                `}
            </style>
            <header className="student-top-header" style={{ backgroundColor: 'white', padding: '1.25rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#004F32', letterSpacing: '-1.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#10B981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004F32', fontSize: '1.2rem' }}>✦</div>
                    CampusEats
                </div>
                <div className="student-header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="location-pill" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F3F4F6', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '1rem', fontWeight: 800 }}>
                        📍 
                        <select 
                            value={locationId} 
                            onChange={(e) => setLocationId(e.target.value)}
                            style={{ background: 'transparent', border: 'none', fontWeight: 800, color: '#111827', outline: 'none', cursor: 'pointer', appearance: 'none', paddingRight: '1rem' }}
                        >
                            <option value="" disabled>Select Drop-off</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <button 
                            className="menu-btn"
                            onClick={() => setShowMenu(!showMenu)} 
                            style={{ background: showMenu ? '#004F32' : 'white', color: showMenu ? 'white' : '#111827', border: '2px solid #E5E7EB', padding: '0.5rem 1rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}
                        >
                            <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <span style={{ width: '18px', height: '2.5px', background: showMenu ? 'white' : '#111827', borderRadius: '2px', transition: 'all 0.2s' }}></span>
                                <span style={{ width: '14px', height: '2.5px', background: showMenu ? 'white' : '#111827', borderRadius: '2px', transition: 'all 0.2s' }}></span>
                                <span style={{ width: '18px', height: '2.5px', background: showMenu ? 'white' : '#111827', borderRadius: '2px', transition: 'all 0.2s' }}></span>
                            </span>
                            <span className="menu-btn-label">Menu</span>
                        </button>
                        {showMenu && (
                            <>
                                <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 98 }} />
                                <div className="student-menu-dropdown" style={{ position: 'absolute', right: 0, top: 'calc(100% + 12px)', background: 'white', borderRadius: '20px', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.06)', minWidth: '220px', zIndex: 99, overflow: 'hidden', animation: 'menuSlideIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
                                    <button onClick={() => { setShowHistory(true); setShowMenu(false); }} style={{ width: '100%', background: 'none', border: 'none', padding: '1.1rem 1.5rem', textAlign: 'left', cursor: 'pointer', fontWeight: 700, fontSize: '1.05rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'background 0.15s', fontFamily: 'inherit' }} onMouseOver={e => e.currentTarget.style.background='#F9FAFB'} onMouseOut={e => e.currentTarget.style.background='none'}>
                                        📜 Order History
                                    </button>
                                    {onOpenProfile && (
                                        <button onClick={() => { onOpenProfile(); setShowMenu(false); }} style={{ width: '100%', background: 'none', border: 'none', borderTop: '1px solid #F3F4F6', padding: '1.1rem 1.5rem', textAlign: 'left', cursor: 'pointer', fontWeight: 700, fontSize: '1.05rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'background 0.15s', fontFamily: 'inherit' }} onMouseOver={e => e.currentTarget.style.background='#F9FAFB'} onMouseOut={e => e.currentTarget.style.background='none'}>
                                            👤 My Profile
                                        </button>
                                    )}
                                    <button onClick={() => { onLogout(); setShowMenu(false); }} style={{ width: '100%', background: 'none', border: 'none', borderTop: '1px solid #F3F4F6', padding: '1.1rem 1.5rem', textAlign: 'left', cursor: 'pointer', fontWeight: 700, fontSize: '1.05rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'background 0.15s', fontFamily: 'inherit' }} onMouseOver={e => e.currentTarget.style.background='#FEF2F2'} onMouseOut={e => e.currentTarget.style.background='none'}>
                                        🚪 Log Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>
            
            {showHistory ? (
                <div className="student-history-container" style={{ padding: '4rem 5%', maxWidth: '1200px', margin: '0 auto', animation: 'slideUpFade 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
                    <div className="student-history-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                        <div>
                            <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-1.5px' }}>Order History</h2>
                            <p style={{ color: '#6B7280', margin: '0.5rem 0 0', fontSize: '1.25rem' }}>Your past campus cravings and deliveries.</p>
                        </div>
                        <button onClick={() => setShowHistory(false)} style={{ background: '#004F32', color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '99px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(0,79,50,0.3)' }}>Back to Order</button>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {history.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '6rem', background: 'white', borderRadius: '40px', border: '2px dashed #E5E7EB' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🥘</div>
                                <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', margin: '0 0 1rem' }}>No orders yet</h3>
                                <p style={{ color: '#6B7280', fontSize: '1.25rem', fontWeight: 500 }}>Drop your first craving to start your history!</p>
                            </div>
                        ) : (
                            history.map(item => (
                                <div key={item.id} className="student-history-card" style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.03)' }}>
                                    <div className="student-history-card-left" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                                        <div style={{ background: '#F3F4F6', padding: '1.25rem', borderRadius: '20px', textAlign: 'center', minWidth: '90px' }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short' })}</p>
                                            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: '#111827' }}>{new Date(item.created_at).getDate()}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: '0 0 0.5rem', color: '#10B981', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.cafeteria}</p>
                                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#111827' }}>{item.request_text}</h3>
                                            <p style={{ margin: '0.75rem 0 0', color: '#6B7280', fontSize: '1rem', fontWeight: 600 }}>Dropped at: 📍 {item.delivery_location_name}</p>
                                        </div>
                                    </div>
                                    <div className="student-history-card-right" style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: '#111827' }}>₦{( (item.estimated_price || 0) + (item.fee || 0) ).toLocaleString()}</p>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: item.status === 'delivered' ? '#10B981' : '#F59E0B', background: item.status === 'delivered' ? '#E6F5ED' : '#FFFBEB', padding: '0.5rem 1rem', borderRadius: '99px', display: 'inline-block', marginTop: '0.75rem', textTransform: 'uppercase' }}>{item.status}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            ) : activeRequest ? (
                /* ========== FULL PAGE LIVE TRACKER ========== */
                <div className="student-tracker-page" style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 5%', animation: 'slideUpFade 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
                    <style>
                        {`
                        @media (max-width: 768px) {
                            .student-tracker-page { padding: 1.5rem 4% !important; }
                            .student-tracker-page h1 { font-size: 2.25rem !important; }
                            .tracker-main-card { padding: 1.75rem !important; border-radius: 28px !important; }
                            .tracker-stepper { gap: 0 !important; }
                            .tracker-stepper-circle { width: 36px !important; height: 36px !important; font-size: 1rem !important; }
                            .tracker-stepper span { font-size: 0.65rem !important; }
                            .tracker-detail-block { padding: 1.25rem !important; }
                            .tracker-detail-block p { font-size: 1.1rem !important; }
                            .tracker-detail-grid { grid-template-columns: 1fr !important; text-align: left !important; }
                            .tracker-detail-grid > div { text-align: left !important; }
                            .tracker-status-banner { padding: 1.25rem !important; }
                            .tracker-status-banner p:last-child { font-size: 1.35rem !important; }
                            .tracker-chat-btn { padding: 1.1rem !important; font-size: 1rem !important; }
                        }
                        @media (max-width: 400px) {
                            .student-tracker-page h1 { font-size: 1.75rem !important; letter-spacing: -1px !important; }
                            .tracker-main-card { padding: 1.25rem !important; border-radius: 24px !important; }
                            .tracker-stepper-circle { width: 30px !important; height: 30px !important; font-size: 0.85rem !important; border-width: 3px !important; }
                            .tracker-stepper span { font-size: 0.55rem !important; }
                        }
                        `}
                    </style>

                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'inline-block', background: '#E6F5ED', color: '#004F32', padding: '0.5rem 1.25rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1rem' }}>
                            🔴 Live • Order #{activeRequest.id.substring(4,10)}
                        </div>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-2px', lineHeight: 1.1 }}>
                            Tracking Your <span style={{ color: '#10B981' }}>Order</span>
                        </h1>
                        <p style={{ color: '#6B7280', margin: '1rem 0 0', fontSize: '1.2rem', fontWeight: 500 }}>
                            {getStatusText(activeRequest.status)}
                        </p>
                    </div>

                    <div className="tracker-main-card" style={{ background: 'white', padding: '3rem', borderRadius: '40px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.03)' }}>
                        
                        {/* Visual Stepper */}
                        {(() => {
                            const stages = ['request_sent', 'accepted', 'at_cafeteria', 'on_way', 'delivered'];
                            const labels = ['Sent', 'Accepted', 'At Caf', 'On Way', 'Delivered'];
                            const emojis = ['📝', '✅', '🍳', '🛵', '🎉'];
                            const currentIdx = stages.indexOf(activeRequest.status);
                            return (
                                <div className="tracker-stepper" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '22px', left: '10%', right: '10%', height: '4px', background: '#E5E7EB', zIndex: 0, borderRadius: '2px' }}></div>
                                    <div style={{ position: 'absolute', top: '22px', left: '10%', width: `${Math.min((currentIdx / (stages.length - 1)) * 80, 80)}%`, height: '4px', background: '#10B981', zIndex: 1, borderRadius: '2px', transition: 'width 0.6s ease' }}></div>
                                    {labels.map((label, i) => (
                                        <div key={label} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                                            <div className="tracker-stepper-circle" style={{ 
                                                width: '44px', height: '44px', borderRadius: '50%', 
                                                background: i <= currentIdx ? '#10B981' : 'white', 
                                                border: `4px solid ${i <= currentIdx ? '#10B981' : '#E5E7EB'}`, 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.25rem', transition: 'all 0.4s',
                                                boxShadow: i === currentIdx ? '0 0 0 6px rgba(16,185,129,0.2)' : 'none'
                                            }}>
                                                {i <= currentIdx ? emojis[i] : ''}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: i <= currentIdx ? '#004F32' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* Status Banner */}
                        <div className="tracker-status-banner" style={{ margin: '0 0 2.5rem', padding: '2rem', background: '#004F32', borderRadius: '24px', textAlign: 'center', color: 'white' }}>
                            <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#A7F3D0', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Current Status</p>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
                                {activeRequest.status.replace(/_/g, ' ').toUpperCase()}
                            </p>
                        </div>

                        {/* Order Details */}
                        <div className="tracker-detail-block" style={{ background: '#F9FAFB', padding: '2rem', borderRadius: '24px', marginBottom: '2rem', border: '1px solid #E5E7EB' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <p style={{ margin: 0, color: '#6B7280', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Pickup from</p>
                                <span style={{ background: '#E6F5ED', color: '#004F32', padding: '0.5rem 1.25rem', borderRadius: '99px', fontSize: '0.9rem', fontWeight: 800 }}>{activeRequest.cafeteria}</span>
                            </div>
                            <p style={{ margin: '0 0 1.5rem', color: '#111827', fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.4 }}>{activeRequest.request_text}</p>
                            
                            <div className="tracker-detail-grid" style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: '#6B7280', fontWeight: 700 }}>Drop-off Zone</p>
                                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📍 {activeRequest.delivery_location_name || 'Pending'}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: '#6B7280', fontWeight: 700 }}>Total Value</p>
                                    <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#004F32' }}>₦{ (parseFloat(activeRequest.estimated_price || 0) + (locations.find(l => l.id == activeRequest.delivery_location_id)?.fee || 0)).toLocaleString() }</p>
                                </div>
                            </div>
                        </div>

                        {/* Chat Button */}
                        {activeRequest.status !== 'request_sent' && (
                            <button 
                                className="tracker-chat-btn"
                                onClick={() => onOpenChat(activeRequest.id)}
                                style={{ width: '100%', background: '#111827', color: 'white', border: 'none', padding: '1.5rem', borderRadius: '99px', cursor: 'pointer', fontWeight: 800, fontSize: '1.15rem', transition: 'all 0.2s', boxShadow: '0 10px 25px -5px rgba(17,24,39,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                                onMouseOver={(e) => {e.currentTarget.style.transform='translateY(-3px)'}} 
                                onMouseOut={(e) => {e.currentTarget.style.transform='translateY(0)'}}
                            >
                                <span>💬</span> Open Live Chat with Rider
                            </button>
                        )}

                        {/* Cancel Button - only before rider is on the way */}
                        {['request_sent', 'accepted', 'at_cafeteria'].includes(activeRequest.status) && (
                            <button 
                                onClick={handleCancel}
                                style={{ width: '100%', background: 'none', color: '#EF4444', border: '2px solid #FEE2E2', padding: '1rem', borderRadius: '99px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', transition: 'all 0.2s', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                onMouseOver={(e) => {e.currentTarget.style.background='#FEF2F2'; e.currentTarget.style.borderColor='#EF4444'}}
                                onMouseOut={(e) => {e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='#FEE2E2'}}
                            >
                                ✕ Cancel Order
                            </button>
                        )}
                    </div>
                </div>

            ) : (
                /* ========== ORDER FORM ========== */
                <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 5%' }}>
                    <style>
                        {`
                        @media (max-width: 768px) {
                            .hero-title { font-size: 2.5rem !important; margin-bottom: 1.5rem !important; }
                            .order-form { padding: 1.5rem !important; border-radius: 24px !important; }
                            .order-form textarea { font-size: 1.05rem !important; padding: 1.1rem !important; border-radius: 18px !important; }
                            .food-tags { gap: 0.5rem !important; }
                            .food-tags button { padding: 0.5rem 0.9rem !important; font-size: 0.85rem !important; }
                            .submit-btn { width: 100% !important; padding: 1rem !important; margin-top: 1.5rem; font-size: 1.1rem !important; }
                            .form-footer { flex-direction: column !important; align-items: flex-start !important; gap: 1.5rem !important; padding: 1.25rem !important; }
                        }
                        @media (max-width: 480px) {
                            .hero-title { font-size: 2rem !important; letter-spacing: -1px !important; }
                            .order-form { padding: 1.25rem !important; }
                        }
                        `}
                    </style>
                    <h1 className="hero-title" style={{ fontSize: '4rem', color: '#111827', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-2px', lineHeight: 1.1 }}>
                        What are you <br/><span style={{ color: '#10B981' }}>craving</span> today?
                    </h1>
                    
                    <form className="order-form" onSubmit={handleSubmit} style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem', color: '#111827' }}>Select Caf</label>
                                <select 
                                    value={cafeteria} 
                                    onChange={(e) => setCafeteria(e.target.value)}
                                    style={{ width: '100%', padding: '1rem 1.5rem', borderRadius: '16px', border: '2px solid #F3F4F6', background: '#F9FAFB', fontSize: '1.1rem', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="New Cafeteria">New Cafeteria</option>
                                    <option value="Old Cafeteria">Old Cafeteria</option>
                                </select>
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem', color: '#111827' }}>Estimated Food Cost (₦)</label>
                                <input 
                                    type="number"
                                    value={estimatedPrice}
                                    onChange={(e) => setEstimatedPrice(e.target.value)}
                                    placeholder="e.g. 1500"
                                    required
                                    style={{ width: '100%', padding: '1rem 1.5rem', borderRadius: '16px', border: '2px solid #F3F4F6', background: '#F9FAFB', fontSize: '1.1rem', fontWeight: 700, outline: 'none' }}
                                />
                            </div>
                        </div>

                        <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem', color: '#111827' }}>Detailed Order</label>
                        <textarea 
                            value={requestText}
                            onChange={(e) => setRequestText(e.target.value)}
                            placeholder="Eg. 2 packs of Jollof rice with turkey, plus a cold Coke."
                            required
                            rows="3"
                            style={{ width: '100%', padding: '1.5rem', border: '2px solid #F3F4F6', background: '#F9FAFB', borderRadius: '24px', fontSize: '1.25rem', outline: 'none', resize: 'none', transition: 'all 0.2s', fontWeight: 500, fontFamily: 'inherit', boxSizing: 'border-box' }}
                            onFocus={(e) => {e.target.style.background='white'; e.target.style.borderColor='#10B981'}} 
                            onBlur={(e) => {e.target.style.background='#F9FAFB'; e.target.style.borderColor='#F3F4F6'}}
                        ></textarea>




                        <div className="form-footer" style={{ marginTop: '2.5rem', padding: '2rem', background: '#F9FAFB', borderRadius: '24px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: '0 0 0.5rem', color: '#6B7280', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Order Summary</p>
                                <div style={{ display: 'flex', gap: '2rem' }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280', fontWeight: 700 }}>Food + Fee</p>
                                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#111827' }}>
                                            ₦{ (parseFloat(estimatedPrice || 0) + (locations.find(l => l.id == locationId)?.fee || 0)).toLocaleString() }
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280', fontWeight: 700 }}>Budget Tier</p>
                                        <select 
                                            value={budgetRange} 
                                            onChange={(e) => setBudgetRange(e.target.value)}
                                            style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', fontWeight: 800, color: '#10B981', outline: 'none', cursor: 'pointer', padding: 0 }}
                                        >
                                            <option value="Economical">Economical (₦)</option>
                                            <option value="Standard">Standard (₦₦)</option>
                                            <option value="Premium">Premium (₦₦₦)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
 
                            <button className="submit-btn" type="submit" style={{ background: '#004F32', color: 'white', border: 'none', padding: '1.25rem 3rem', borderRadius: '99px', fontSize: '1.25rem', fontWeight: 900, cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 25px -5px rgba(0,79,50,0.4)' }}>
                                Drop Request ➔
                            </button>
                        </div>
                    </form>
                </main>
            )}
        </div>
    );
}

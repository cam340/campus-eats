import React, { useState, useEffect } from 'react';
import { api, socket } from '../api';

export default function RiderDashboard({ userId, onOpenChat, initialShowHistory = false }) {
    const [available, setAvailable] = useState([]);
    const [activeDelivery, setActiveDelivery] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(initialShowHistory);

    // Computed analytics from history
    const deliveredOrders = history.filter(h => h.status === 'delivered');
    const totalEarnings = deliveredOrders.reduce((sum, h) => sum + (h.fee || 0), 0);
    const deliveredCount = deliveredOrders.length;
    const avgEarning = deliveredCount > 0 ? Math.round(totalEarnings / deliveredCount) : 0;

    // Fetch history whenever the history tab is shown (or on mount if initialShowHistory)
    useEffect(() => {
        if (showHistory && userId) {
            api.requests.getRiderHistory(userId).then(data => {
                console.log('📜 Rider history fetched:', data?.length, 'items');
                setHistory(data || []);
            }).catch(console.error);
        }
    }, [showHistory, userId]);

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                // 1. Fetch available pool
                const av = await api.requests.getAvailable();
                setAvailable(av);

                // 2. Check if rider has an active assignment (Persistence)
                const active = await api.requests.getRiderActive(userId);
                if (active && active.length > 0) {
                    setActiveDelivery(active[0]);
                }

                // 3. Pre-fetch history so it's ready
                const hist = await api.requests.getRiderHistory(userId);
                console.log('📜 Rider history pre-fetched:', hist?.length, 'items');
                setHistory(hist || []);
            } catch (err) {
                console.error("Failed to fetch initial data:", err);
            }
        };
        fetchInitial();

        const handleNewReq = (req) => {
            setAvailable(prev => [req, ...prev]);
        };

        const handleReqUpdate = (req) => {
            if (req.status !== 'request_sent') {
                setAvailable(prev => prev.filter(r => r.id !== req.id));
            }
            // If our active delivery was updated elsewhere (e.g. by admin or chat)
            if (activeDelivery && req.id === activeDelivery.id) {
                if (req.status === 'delivered') {
                    setActiveDelivery(null);
                    // Refresh history after delivery completion
                    api.requests.getRiderHistory(userId).then(h => setHistory(h || [])).catch(console.error);
                } else {
                    setActiveDelivery(req);
                }
            }
        };

        socket.on('new_request', handleNewReq);
        socket.on('request_updated', handleReqUpdate);

        return () => {
            socket.off('new_request', handleNewReq);
            socket.off('request_updated', handleReqUpdate);
        };
    }, [userId, activeDelivery?.id]);

    const acceptOrder = async (order) => {
        try {
            const updated = await api.requests.updateStatus(order.id, 'accepted', userId);
            setActiveDelivery(updated);
            // Refresh history after a change might affect it (though usually only on 'delivered')
        } catch (error) {
            alert('Error accepting: ' + error.message);
        }
    };

    const getNextStatusInfo = () => {
        const flow = {
            'accepted': { label: "I'm at the Cafeteria", next: 'at_cafeteria' },
            'at_cafeteria': { label: "I'm on my way", next: 'on_way' },
            'on_way': { label: "Order Delivered", next: 'delivered' }
        };
        return flow[activeDelivery.status] || { label: "Completed", next: null };
    };

    const advanceStatus = async () => {
        const { next } = getNextStatusInfo();
        if (!next) {
            setActiveDelivery(null);
            return;
        }

        try {
            const updated = await api.requests.updateStatus(activeDelivery.id, next, userId);
            if (next === 'delivered') {
                setActiveDelivery(null);
                api.requests.getRiderHistory(userId).then(setHistory).catch(console.error);
            } else {
                setActiveDelivery(updated);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const Stepper = ({ currentStatus }) => {
        const stages = ['accepted', 'at_cafeteria', 'on_way', 'delivered'];
        const currentIdx = stages.indexOf(currentStatus);
        
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', left: 0, right: 0, height: '4px', background: '#E5E7EB', zIndex: 0 }}></div>
                <div style={{ position: 'absolute', top: '15px', left: 0, width: `${(currentIdx / 3) * 100}%`, height: '4px', background: '#10B981', zIndex: 1, transition: 'width 0.4s' }}></div>
                
                {['Accepted', 'In Kitchen', 'Delivery', 'Success'].map((label, i) => (
                    <div key={label} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: i <= currentIdx ? '#10B981' : 'white', border: `4px solid ${i <= currentIdx ? '#10B981' : '#E5E7EB'}`, transition: 'all 0.3s' }}></div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: i <= currentIdx ? '#004F32' : '#9CA3AF' }}>{label}</span>
                    </div>
                ))}
            </div>
        );
    };

    if (activeDelivery) {
        const { label } = getNextStatusInfo();
        return (
            <div style={{ animation: 'slideUpFade 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
                <style>
                    {`
                    @media (max-width: 600px) {
                        .active-delivery-card { padding: 1.5rem !important; border-radius: 24px !important; }
                        .active-delivery-title { font-size: 2rem !important; }
                        .mission-details { padding: 1.5rem !important; }
                        .mission-text { font-size: 1.25rem !important; }
                        .action-btn { font-size: 1.1rem !important; padding: 1.25rem !important; }
                        .queue-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
                        .queue-card { padding: 1.5rem !important; }
                    }
                    `}
                </style>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                    <div>
                        <p style={{ margin: '0 0 0.5rem', color: '#10B981', fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Mission</p>
                        <h2 className="active-delivery-title" style={{ fontSize: '3rem', color: '#111827', margin: 0, fontWeight: 900, letterSpacing: '-1px' }}>Active Delivery</h2>
                    </div>
                </div>
                
                <div className="active-delivery-card" style={{ background: 'white', padding: '3.5rem', borderRadius: '40px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.03)' }}>
                    <Stepper currentStatus={activeDelivery.status} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h3 style={{ margin: 0, color: '#6B7280', fontSize: '1.25rem', fontWeight: 600 }}>ID: <span style={{ color: '#111827' }}>{activeDelivery.id.substring(4,10)}</span></h3>
                        <div style={{ background: '#F9FAFB', color: '#111827', padding: '0.75rem 1.5rem', borderRadius: '99px', fontSize: '1rem', fontWeight: 800 }}>
                            {activeDelivery.budget_range || 'Standard'}
                        </div>
                    </div>

                    <div className="mission-details" style={{ padding: '2.5rem', background: '#F9FAFB', borderRadius: '24px', border: '1px solid #E5E7EB', marginBottom: '2.5rem' }}>
                        <p style={{ margin: '0 0 0.5rem', color: '#6B7280', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Pickup Request</p>
                        <p className="mission-text" style={{ margin: '0', color: '#111827', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.4 }}>{activeDelivery.request_text}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                        <div style={{ width: '4rem', height: '4rem', background: '#E6F5ED', color: '#004F32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📍</div>
                        <div>
                            <p style={{ margin: '0 0 0.25rem', color: '#6B7280', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Drop-off Zone</p>
                            <p style={{ margin: 0, color: '#111827', fontSize: '1.5rem', fontWeight: 800 }}>{activeDelivery.delivery_location_name || 'Loading...'}</p>
                        </div>
                    </div>
                    
                    <div style={{ margin: '0 0 3rem', padding: '1.5rem', background: '#004F32', borderRadius: '24px', textAlign: 'center', color: 'white' }}>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#A7F3D0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Action Required Stage</p>
                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
                            {activeDelivery.status.replace('_', ' ').toUpperCase()}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', flexDirection: 'column' }}>
                        <button 
                            onClick={advanceStatus}
                            style={{ width: '100%', background: '#10B981', color: '#004F32', border: 'none', padding: '1.5rem', borderRadius: '99px', cursor: 'pointer', fontWeight: 900, fontSize: '1.25rem', transition: 'all 0.2s', boxShadow: '0 10px 25px -5px rgba(16,185,129,0.4)' }}
                            onMouseOver={(e) => {e.currentTarget.style.transform='translateY(-3px)'}} 
                            onMouseOut={(e) => {e.currentTarget.style.transform='translateY(0)'}}
                        >
                            {label} ➔
                        </button>
                        <button 
                            onClick={() => onOpenChat(activeDelivery.id)}
                            style={{ width: '100%', background: 'white', color: '#111827', border: '2px solid #E5E7EB', padding: '1.5rem', borderRadius: '99px', cursor: 'pointer', fontWeight: 800, fontSize: '1.25rem', transition: 'all 0.2s' }}
                            onMouseOver={(e) => {e.currentTarget.style.background='#F9FAFB'}} 
                            onMouseOut={(e) => {e.currentTarget.style.background='white'}}
                        >
                            Open Live Chat with Student
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ animation: 'slideUpFade 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-1.5px' }}>Live Order Queue</h2>
                    <p style={{ color: '#6B7280', margin: '0.5rem 0 0', fontSize: '1.25rem', fontWeight: 500 }}>Select a delivery to start earning instantly.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={() => setShowHistory(true)} style={{ background: 'white', color: '#111827', border: '2px solid #E5E7EB', padding: '0.75rem 1.5rem', borderRadius: '99px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseOver={(e) => e.currentTarget.style.borderColor = '#10B981'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}>
                        📜 View My History
                    </button>
                    <div style={{ background: '#E6F5ED', color: '#004F32', padding: '0.75rem 1.5rem', borderRadius: '99px', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '10px', height: '10px', background: '#10B981', borderRadius: '50%', display: 'inline-block' }}></span>
                        Online
                    </div>
                </div>
            </div>

            {/* Earnings Analytics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ background: 'white', padding: '2rem 2.5rem', borderRadius: '28px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.03)' }}>
                    <p style={{ margin: '0 0 0.5rem', color: '#6B7280', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Earnings</p>
                    <p style={{ margin: 0, fontSize: '2.25rem', fontWeight: 900, color: '#004F32', letterSpacing: '-1px' }}>₦{totalEarnings.toLocaleString()}</p>
                </div>
                <div style={{ background: 'white', padding: '2rem 2.5rem', borderRadius: '28px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.03)' }}>
                    <p style={{ margin: '0 0 0.5rem', color: '#6B7280', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Deliveries Done</p>
                    <p style={{ margin: 0, fontSize: '2.25rem', fontWeight: 900, color: '#111827', letterSpacing: '-1px' }}>{deliveredCount}</p>
                </div>
                <div style={{ background: 'white', padding: '2rem 2.5rem', borderRadius: '28px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.03)' }}>
                    <p style={{ margin: '0 0 0.5rem', color: '#6B7280', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Avg per Delivery</p>
                    <p style={{ margin: 0, fontSize: '2.25rem', fontWeight: 900, color: '#10B981', letterSpacing: '-1px' }}>₦{avgEarning.toLocaleString()}</p>
                </div>
            </div>

            {showHistory && (
                 <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#F9FAFB', zIndex: 1000, padding: '4rem 5%', overflowY: 'auto', animation: 'slideUpFade 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                            <div>
                                <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-2px' }}>Delivery History</h2>
                                <p style={{ color: '#6B7280', margin: '0.5rem 0 0', fontSize: '1.35rem', fontWeight: 500 }}>Track your successful missions and total earnings.</p>
                            </div>
                            <button onClick={() => setShowHistory(false)} style={{ background: '#004F32', color: 'white', border: 'none', padding: '1.25rem 3rem', borderRadius: '99px', fontWeight: 900, fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 15px 30px -5px rgba(0,79,50,0.3)' }}>Return to Queue</button>
                        </div>

                        {/* Earnings Summary Card */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div style={{ background: '#004F32', padding: '2.5rem', borderRadius: '32px', textAlign: 'center', color: 'white' }}>
                                <p style={{ margin: '0 0 0.75rem', color: '#A7F3D0', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Total Earned</p>
                                <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px' }}>₦{totalEarnings.toLocaleString()}</p>
                            </div>
                            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.04)' }}>
                                <p style={{ margin: '0 0 0.75rem', color: '#6B7280', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Completed</p>
                                <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, color: '#111827', letterSpacing: '-1px' }}>{deliveredCount}</p>
                            </div>
                            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.04)' }}>
                                <p style={{ margin: '0 0 0.75rem', color: '#6B7280', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Avg Earning</p>
                                <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, color: '#10B981', letterSpacing: '-1px' }}>₦{avgEarning.toLocaleString()}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {history.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '8rem 2rem', background: 'white', borderRadius: '40px', border: '2px dashed #E5E7EB' }}>
                                    <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>🏎️</div>
                                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#111827', margin: '0 0 1rem' }}>No missions yet</h3>
                                    <p style={{ color: '#6B7280', fontSize: '1.25rem', fontWeight: 500 }}>Accept your first delivery to start building your record!</p>
                                </div>
                            ) : (
                                history.map(item => (
                                    <div key={item.id} style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.04)' }}>
                                        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
                                            <div style={{ background: '#E6F5ED', color: '#004F32', padding: '1.5rem', borderRadius: '24px', textAlign: 'center', minWidth: '100px' }}>
                                                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase' }}>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short' })}</p>
                                                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 900 }}>{new Date(item.created_at).getDate()}</p>
                                            </div>
                                            <div>
                                                <p style={{ margin: '0 0 0.5rem', color: '#10B981', fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase' }}>PICKUP: {item.cafeteria}</p>
                                                <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: '#111827' }}>{item.request_text}</h3>
                                                <p style={{ margin: '1rem 0 0', color: '#6B7280', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📍 {item.delivery_location_name}</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontSize: '1rem', color: '#6B7280', fontWeight: 800, letterSpacing: '1px' }}>EARNING</p>
                                            <p style={{ margin: '0.25rem 0 0', fontSize: '2rem', fontWeight: 900, color: '#111827' }}>₦{(item.fee || 0).toLocaleString()}</p>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: item.status === 'delivered' ? '#10B981' : '#F59E0B', background: item.status === 'delivered' ? '#E6F5ED' : '#FFFBEB', padding: '0.5rem 1.25rem', borderRadius: '99px', display: 'inline-block', marginTop: '1rem', textTransform: 'uppercase' }}>{item.status}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                 </div>
            )}

            <div className="queue-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2.5rem' }}>
                {available.length === 0 ? (
                    <div style={{ background: 'white', padding: '6rem', borderRadius: '40px', textAlign: 'center', gridColumn: '1 / -1', border: '2px dashed #E5E7EB' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>😴</div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', margin: '0 0 1rem', letterSpacing: '-1px' }}>No orders yet</h3>
                        <p style={{ color: '#6B7280', fontSize: '1.25rem', fontWeight: 500 }}>Waiting for students to drop their cravings in the queue.</p>
                    </div>
                ) : (
                    available.map(item => (
                        <div className="queue-card" key={item.id} style={{ background: 'white', padding: '3rem', borderRadius: '32px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.02)', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} onMouseOver={(e) => {e.currentTarget.style.transform='translateY(-8px)'; e.currentTarget.style.boxShadow='0 30px 60px -15px rgba(0,0,0,0.1)'}} onMouseOut={(e) => {e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 20px 40px -15px rgba(0,0,0,0.05)'}}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.9rem', fontWeight: 800 }}>ID: {item.id.substring(4,10)}</span>
                                    <span style={{ color: '#004F32', fontWeight: 900, fontSize: '1.25rem', background: '#E6F5ED', padding: '0.5rem 1rem', borderRadius: '99px' }}>{item.budget_range?.replace('$', '₦') || '₦₦'}</span>
                                </div>
                                <p style={{ margin: '0 0 0.5rem', color: '#10B981', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>{item.cafeteria || 'Cafeteria'}</p>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', margin: '0 0 1.5rem', lineHeight: 1.3, letterSpacing: '-0.5px' }}>{item.request_text}</h3>
                                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '1rem' }}>
                                     <span style={{ color: '#6B7280', fontWeight: 600 }}>Food Value:</span>
                                     <span style={{ color: '#111827', fontWeight: 800 }}>₦{(item.estimated_price || 0).toLocaleString()}</span>
                                </div>
                                <p style={{ margin: '0 0 3rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, fontSize: '1.1rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📍</span> <span style={{ color: '#111827' }}>{item.delivery_location_name || 'Unknown'}</span>
                                </p>
                            </div>
                            <button 
                                onClick={() => acceptOrder(item)}
                                style={{ width: '100%', background: '#004F32', color: 'white', border: 'none', padding: '1.25rem', borderRadius: '99px', cursor: 'pointer', fontWeight: 800, fontSize: '1.2rem', transition: 'all 0.2s', boxShadow: '0 10px 25px -5px rgba(0,79,50,0.3)' }}
                                onMouseOver={(e) => {e.currentTarget.style.background='#10B981'; e.currentTarget.style.color='#004F32'}} 
                                onMouseOut={(e) => {e.currentTarget.style.background='#004F32'; e.currentTarget.style.color='white'}}
                            >
                                Accept Delivery Now
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

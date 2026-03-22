import React, { useState, useEffect } from 'react';
import { api, socket } from '../api';

export default function RiderDashboard({ userId, onOpenChat }) {
    const [available, setAvailable] = useState([]);
    const [activeDelivery, setActiveDelivery] = useState(null);

    useEffect(() => {
        const fetchAvailable = async () => {
            try {
                const data = await api.requests.getAvailable();
                setAvailable(data);
            } catch (err) {
                console.error("Failed to fetch available:", err);
            }
        };
        fetchAvailable();

        const handleNewReq = (req) => {
            setAvailable(prev => [req, ...prev]);
        };

        const handleReqUpdate = (req) => {
            if (req.status !== 'request_sent') {
                setAvailable(prev => prev.filter(r => r.id !== req.id));
            }
        };

        socket.on('new_request', handleNewReq);
        socket.on('request_updated', handleReqUpdate);

        return () => {
            socket.off('new_request', handleNewReq);
            socket.off('request_updated', handleReqUpdate);
        };
    }, []);

    const acceptOrder = async (order) => {
        try {
            const updated = await api.requests.updateStatus(order.id, 'accepted', userId);
            setActiveDelivery(updated);
        } catch (error) {
            alert('Error accepting: ' + error.message);
        }
    };

    const advanceStatus = async () => {
        const statuses = ['accepted', 'at_cafeteria', 'on_way', 'delivered'];
        const currentIdx = statuses.indexOf(activeDelivery.status);
        
        if (currentIdx < statuses.length - 1) {
            const nextStatus = statuses[currentIdx + 1];
            try {
                const updated = await api.requests.updateStatus(activeDelivery.id, nextStatus);
                setActiveDelivery(updated);
            } catch (error) {
                console.error(error);
            }
        } else {
            setActiveDelivery(null);
        }
    };

    // ... exactly the same UI output logic ...
    if (activeDelivery) {
        return (
            <div style={{ animation: 'slideUpFade 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                    <div>
                        <p style={{ margin: '0 0 0.5rem', color: '#10B981', fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Mission</p>
                        <h2 style={{ fontSize: '3rem', color: '#111827', margin: 0, fontWeight: 900, letterSpacing: '-1px' }}>Active Delivery</h2>
                    </div>
                </div>
                
                <div style={{ background: 'white', padding: '3.5rem', borderRadius: '32px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h3 style={{ margin: 0, color: '#6B7280', fontSize: '1.25rem', fontWeight: 600 }}>Order ID: <span style={{ color: '#111827' }}>{activeDelivery.id.substring(4,10)}</span></h3>
                        <div style={{ background: '#F9FAFB', color: '#111827', padding: '0.75rem 1.5rem', borderRadius: '99px', fontSize: '1rem', fontWeight: 800 }}>
                            {activeDelivery.budget_range || 'Standard'}
                        </div>
                    </div>

                    <div style={{ padding: '2.5rem', background: '#F9FAFB', borderRadius: '24px', border: '1px solid #E5E7EB', marginBottom: '2.5rem' }}>
                        <p style={{ margin: '0 0 0.5rem', color: '#6B7280', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Pickup Request</p>
                        <p style={{ margin: '0', color: '#111827', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.4 }}>{activeDelivery.request_text}</p>
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
                            Complete Stage & Advance ➔
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
                <div style={{ background: '#E6F5ED', color: '#004F32', padding: '0.75rem 1.5rem', borderRadius: '99px', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '10px', height: '10px', background: '#10B981', borderRadius: '50%', display: 'inline-block' }}></span>
                    Online
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2.5rem' }}>
                {available.length === 0 ? (
                    <div style={{ background: 'white', padding: '6rem', borderRadius: '40px', textAlign: 'center', gridColumn: '1 / -1', border: '2px dashed #E5E7EB' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>😴</div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', margin: '0 0 1rem', letterSpacing: '-1px' }}>No orders yet</h3>
                        <p style={{ color: '#6B7280', fontSize: '1.25rem', fontWeight: 500 }}>Waiting for students to drop their cravings in the queue.</p>
                    </div>
                ) : (
                    available.map(item => (
                        <div key={item.id} style={{ background: 'white', padding: '3rem', borderRadius: '32px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.02)', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} onMouseOver={(e) => {e.currentTarget.style.transform='translateY(-8px)'; e.currentTarget.style.boxShadow='0 30px 60px -15px rgba(0,0,0,0.1)'}} onMouseOut={(e) => {e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 20px 40px -15px rgba(0,0,0,0.05)'}}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.9rem', fontWeight: 800 }}>ID: {item.id.substring(4,10)}</span>
                                    <span style={{ color: '#004F32', fontWeight: 900, fontSize: '1.25rem', background: '#E6F5ED', padding: '0.5rem 1rem', borderRadius: '99px' }}>{item.budget_range || '$$'}</span>
                                </div>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', margin: '0 0 1.5rem', lineHeight: 1.3, letterSpacing: '-0.5px' }}>{item.request_text}</h3>
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

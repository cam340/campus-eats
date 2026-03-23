import React, { useState, useEffect } from 'react';
import { api, socket } from '../api';
import { useToast } from './Toast';

export default function StudentDashboard({ userId, onLogout, onOpenChat, onOpenProfile }) {
    const toast = useToast();
    const [locations, setLocations] = useState([]);
    const [requestText, setRequestText] = useState('');
    const [locationId, setLocationId] = useState('');
    const [budgetRange, setBudgetRange] = useState('Standard');
    const [activeRequest, setActiveRequest] = useState(null);

    useEffect(() => {
        console.log("StudentDashboard mounted for user:", userId);
        const fetchInitial = async () => {
            try {
                console.log("Fetching locations...");
                const locs = await api.locations.getAll();
                console.log("Locations fetched:", locs?.length);
                setLocations(locs || []);

                console.log("Fetching active request for student:", userId);
                const reqs = await api.requests.getStudentActive(userId);
                console.log("Active requests found:", reqs?.length);
                if (reqs && reqs.length > 0) setActiveRequest(reqs[0]);
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
                budget_range: budgetRange
            });
            setActiveRequest(newReq);
            setRequestText('');
        } catch (error) {
            toast('Error submitting request: ' + error.message, 'error');
        }
    };

    const getStatusText = (status) => {
        const statuses = {
            'request_sent': 'Looking for an available Rider...',
            'accepted': 'Rider Accepted! Heading to Caf.',
            'at_cafeteria': 'Rider is at the Cafeteria picking up your order.',
            'on_way': 'Rider is on their way! Check your chat.',
            'delivered': 'Delivered! Enjoy your meal.'
        };
        return statuses[status] || status;
    };

    return (
        <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            <header style={{ backgroundColor: 'white', padding: '1.25rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#004F32', letterSpacing: '-1.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#10B981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004F32', fontSize: '1.2rem' }}>✦</div>
                    CampusEats
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F3F4F6', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '1rem', fontWeight: 800 }}>
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
                    {onOpenProfile && (
                        <button onClick={onOpenProfile} style={{ background: '#004F32', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '99px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            👤 Profile
                        </button>
                    )}
                    <button onClick={onLogout} style={{ background: 'white', border: '2px solid #E5E7EB', color: '#111827', padding: '0.5rem 1.5rem', borderRadius: '99px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => {e.currentTarget.style.background='#F9FAFB'}} onMouseOut={(e) => {e.currentTarget.style.background='white'}}>
                        Log Out
                    </button>
                </div>
            </header>

            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '4rem 5%', display: 'flex', gap: '4rem', flexDirection: 'row' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '4rem', color: '#111827', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-2px', lineHeight: 1.1 }}>
                        What are you <br/><span style={{ color: '#10B981' }}>craving</span> today?
                    </h1>
                    
                    <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <textarea 
                            value={requestText}
                            onChange={(e) => setRequestText(e.target.value)}
                            placeholder="Eg. 2 packs of Jollof rice with turkey from New Caf, plus a cold Coke."
                            required
                            rows="4"
                            style={{ width: '100%', padding: '1.5rem', border: '2px solid #F3F4F6', background: '#F9FAFB', borderRadius: '24px', fontSize: '1.25rem', outline: 'none', resize: 'none', transition: 'all 0.2s', fontWeight: 500, fontFamily: 'inherit', boxSizing: 'border-box' }}
                            onFocus={(e) => {e.target.style.background='white'; e.target.style.borderColor='#10B981'}} 
                            onBlur={(e) => {e.target.style.background='#F9FAFB'; e.target.style.borderColor='#F3F4F6'}}
                        ></textarea>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                            {['🍛 Jollof', '🍗 Fried Rice', '🥤 Cold Drinks', '🍔 Snacks', '🥘 Swallow'].map(tag => (
                                <button 
                                    type="button" 
                                    key={tag}
                                    onClick={() => setRequestText(prev => prev ? `${prev}, ${tag}` : tag)}
                                    style={{ background: '#F3F4F6', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '99px', fontWeight: 700, color: '#4B5563', cursor: 'pointer', transition: 'all 0.2s', fontSize: '1rem' }}
                                    onMouseOver={(e) => {e.currentTarget.style.background='#E5E7EB'; e.currentTarget.style.color='#111827'}} 
                                    onMouseOut={(e) => {e.currentTarget.style.background='#F3F4F6'; e.currentTarget.style.color='#4B5563'}}
                                >
                                    + {tag}
                                </button>
                            ))}
                        </div>

                        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem', color: '#111827' }}>Budget Tier</label>
                                <select 
                                    value={budgetRange} 
                                    onChange={(e) => setBudgetRange(e.target.value)}
                                    style={{ padding: '1rem 1.5rem', borderRadius: '16px', border: '2px solid #F3F4F6', background: '#F9FAFB', fontSize: '1.1rem', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="Economical">Economical ($)</option>
                                    <option value="Standard">Standard ($$)</option>
                                    <option value="Premium">Premium ($$$)</option>
                                </select>
                            </div>

                            <button type="submit" disabled={!!activeRequest} style={{ background: activeRequest ? '#D1D5DB' : '#004F32', color: 'white', border: 'none', padding: '1.25rem 3rem', borderRadius: '99px', fontSize: '1.25rem', fontWeight: 900, cursor: activeRequest ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: activeRequest ? 'none' : '0 10px 25px -5px rgba(0,79,50,0.4)' }} onMouseOver={(e) => {if(!activeRequest) {e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.background='#10B981'; e.currentTarget.style.color='#004F32'}}} onMouseOut={(e) => {if(!activeRequest) {e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.background='#004F32'; e.currentTarget.style.color='white'}}}>
                                Drop Request ➔
                            </button>
                        </div>
                    </form>
                </div>

                <div style={{ width: '450px', flexShrink: 0 }}>
                    {activeRequest ? (
                        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '40px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.03)', position: 'sticky', top: '120px', animation: 'slideUpFade 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                                <div style={{ background: '#E6F5ED', color: '#004F32', padding: '0.75rem 1.5rem', borderRadius: '99px', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Live Tracker
                                </div>
                                <div style={{ color: '#6B7280', fontWeight: 700 }}>#{activeRequest.id.substring(4,10)}</div>
                            </div>
                            
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#111827', letterSpacing: '-1px' }}>Order Status</h2>
                            <p style={{ color: '#004F32', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 2rem' }}>
                                {getStatusText(activeRequest.status)}
                            </p>

                            <div style={{ background: '#F9FAFB', padding: '1.5rem', borderRadius: '24px', marginBottom: '2.5rem', border: '1px solid #E5E7EB' }}>
                                <p style={{ margin: '0 0 0.5rem', color: '#6B7280', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Your Order</p>
                                <p style={{ margin: 0, color: '#111827', fontWeight: 800, fontSize: '1.1rem' }}>{activeRequest.request_text}</p>
                            </div>

                            {activeRequest.status !== 'request_sent' && (
                                <button 
                                    onClick={() => onOpenChat(activeRequest.id)}
                                    style={{ width: '100%', background: '#111827', color: 'white', border: 'none', padding: '1.25rem', borderRadius: '99px', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem', transition: 'all 0.2s', boxShadow: '0 10px 25px -5px rgba(17,24,39,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                                    onMouseOver={(e) => {e.currentTarget.style.transform='translateY(-3px)'}} 
                                    onMouseOut={(e) => {e.currentTarget.style.transform='translateY(0)'}}
                                >
                                    <span>💬</span> Open Rider Chat
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{ background: 'rgba(255,255,255,0.5)', border: '2px dashed #E5E7EB', borderRadius: '40px', height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', filter: 'grayscale(1)', opacity: 0.5, marginBottom: '1rem' }}>🛒</div>
                            <h3 style={{ fontSize: '1.5rem', color: '#9CA3AF', fontWeight: 800 }}>No Active Orders</h3>
                            <p style={{ color: '#9CA3AF', fontWeight: 600 }}>Drop a request on the left and magic will happen here.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

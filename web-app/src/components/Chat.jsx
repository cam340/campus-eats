import React, { useState, useEffect, useRef } from 'react';
import { api, socket } from '../api';

export default function Chat({ userId, role, requestId, onClose }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const scrollRef = useRef(null);
    
    const myId = userId;

    useEffect(() => {
        if (!requestId) return;
        
        const fetchMessages = async () => {
            try {
                const data = await api.messages.getByRequest(requestId);
                setMessages(data);
            } catch (err) {
                console.error("Failed to load messages:", err);
            }
        };
        fetchMessages();

        // Join the specific request room
        socket.emit('join_chat', requestId);

        const handleNewMessage = (newMsg) => {
            setMessages(prev => [...prev, newMsg]);
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [requestId]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const sendMsg = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        
        try {
            await api.messages.send({
                request_id: requestId,
                sender_id: myId,
                content: message.trim()
            });
            setMessage('');
        } catch (error) {
            alert("Chat error: " + error.message);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '600px', background: 'white', borderRadius: '32px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', background: '#004F32', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Live Dispatch Chat</h3>
                    <p style={{ margin: '0.25rem 0 0', color: '#A7F3D0', fontSize: '0.9rem', fontWeight: 600 }}>Order ID: #{requestId?.substring(4,10)}</p>
                </div>
                {onClose && (
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', transition: 'background 0.2s' }} onMouseOver={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.3)'} onMouseOut={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.2)'}>✕</button>
                )}
            </div>

            <div ref={scrollRef} style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#9CA3AF', margin: 'auto', fontWeight: 600, fontSize: '1.1rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>💬</div>
                        No messages yet.<br/>Start the conversation!
                    </div>
                ) : (
                    messages.map(msg => {
                        const isMe = msg.sender_id === myId;
                        return (
                            <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                <div style={{ background: isMe ? '#10B981' : 'white', color: isMe ? 'white' : '#111827', padding: '1rem 1.5rem', borderRadius: isMe ? '24px 24px 4px 24px' : '24px 24px 24px 4px', boxShadow: isMe ? '0 10px 15px -3px rgba(16,185,129,0.2)' : '0 10px 15px -3px rgba(0,0,0,0.05)', fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.5, border: isMe ? 'none' : '1px solid #E5E7EB' }}>
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div style={{ padding: '1.5rem 2rem', background: 'white', borderTop: '1px solid #E5E7EB' }}>
                <form onSubmit={sendMsg} style={{ display: 'flex', gap: '1rem' }}>
                    <input 
                        type="text" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..." 
                        style={{ flex: 1, padding: '1.25rem 1.5rem', background: '#F9FAFB', border: '2px solid transparent', borderRadius: '99px', fontSize: '1.1rem', outline: 'none', transition: 'all 0.2s', fontWeight: 500 }}
                        onFocus={(e)=>{e.target.style.background='white'; e.target.style.borderColor='#10B981'}}
                        onBlur={(e)=>{e.target.style.background='#F9FAFB'; e.target.style.borderColor='transparent'}}
                    />
                    <button type="submit" style={{ background: '#004F32', color: 'white', border: 'none', width: '60px', borderRadius: '99px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 8px 20px -5px rgba(0,79,50,0.4)' }} onMouseOver={(e)=>{e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.background='#10B981'}} onMouseOut={(e)=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.background='#004F32'}}>
                        <span style={{ transform: 'rotate(-45deg)', margin: '0 0 4px 4px', fontSize: '1.25rem' }}>➔</span>
                    </button>
                </form>
            </div>
        </div>
    );
}

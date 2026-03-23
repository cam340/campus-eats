import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useToast } from './Toast';

export default function Profile({ userId, role, onClose }) {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    useEffect(() => {
        api.profile.get(userId).then(data => {
            setProfile(data);
            setForm(data);
        }).catch(() => toast('Failed to load profile', 'error'));
    }, [userId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await api.profile.update(userId, {
                full_name: form.full_name,
                phone_number: form.phone_number,
                hostel_name: form.hostel_name,
                room_number: form.room_number,
            });
            setProfile(updated);
            // Update localStorage with new name
            const stored = JSON.parse(localStorage.getItem('campus_user') || '{}');
            localStorage.setItem('campus_user', JSON.stringify({ ...stored, full_name: updated.full_name, name: updated.name }));
            setEditing(false);
            toast('Profile updated successfully!', 'success');
        } catch (e) {
            toast('Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!profile) return (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#6B7280' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            Loading profile...
        </div>
    );

    const Field = ({ label, field, type = 'text' }) => (
        <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.5rem', color: '#6B7280', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</label>
            {editing ? (
                <input
                    type={type}
                    value={form[field] || ''}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    style={{
                        width: '100%', padding: '1rem 1.25rem', border: '2px solid #E5E7EB',
                        background: 'white', borderRadius: '16px', fontSize: '1.1rem',
                        outline: 'none', transition: 'all 0.2s', fontWeight: 600, fontFamily: 'inherit',
                        boxSizing: 'border-box'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#10B981'; }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; }}
                />
            ) : (
                <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>
                    {profile[field] || '—'}
                </p>
            )}
        </div>
    );

    return (
        <div style={{ animation: 'slideUpFade 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <p style={{ margin: '0 0 0.5rem', color: '#10B981', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {role === 'rider' ? '🛵 Rider Profile' : '🎓 Student Profile'}
                    </p>
                    <h2 style={{ fontSize: '2.5rem', color: '#111827', margin: 0, fontWeight: 900, letterSpacing: '-1px' }}>
                        My Profile
                    </h2>
                </div>
                {onClose && (
                    <button onClick={onClose} style={{
                        background: '#F3F4F6', border: 'none', borderRadius: '50%',
                        width: '48px', height: '48px', fontSize: '1.25rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
                    }}>✕</button>
                )}
            </div>

            {/* Avatar */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '1.5rem',
                padding: '2rem', background: 'linear-gradient(135deg, #E6F5ED, #F0FDF4)',
                borderRadius: '24px', marginBottom: '2.5rem'
            }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: role === 'rider' ? '#10B981' : '#004F32',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', fontWeight: 900, flexShrink: 0
                }}>
                    {(profile.full_name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>
                        {profile.full_name || 'Unknown'}
                    </h3>
                    <p style={{ margin: 0, color: '#6B7280', fontWeight: 600 }}>{profile.email}</p>
                    <span style={{
                        display: 'inline-block', marginTop: '0.5rem',
                        padding: '0.35rem 1rem', borderRadius: '99px', fontSize: '0.8rem',
                        fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px',
                        background: role === 'rider' ? '#10B981' : '#004F32', color: 'white'
                    }}>
                        {role}
                    </span>
                </div>
            </div>

            {/* Fields */}
            <div style={{
                background: 'white', padding: '2.5rem', borderRadius: '24px',
                border: '1px solid #E5E7EB', boxShadow: '0 10px 25px -10px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
                    <Field label="Full Name" field="full_name" />
                    <Field label="Phone Number" field="phone_number" type="tel" />
                    <Field label="Hostel Name" field="hostel_name" />
                    <Field label="Room Number" field="room_number" />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    {editing ? (
                        <>
                            <button onClick={handleSave} disabled={saving} style={{
                                background: '#004F32', color: 'white', border: 'none',
                                padding: '1rem 2.5rem', borderRadius: '99px', fontSize: '1.1rem',
                                fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: '0 8px 20px -5px rgba(0,79,50,0.3)'
                            }}>
                                {saving ? 'Saving...' : 'Save Changes ✓'}
                            </button>
                            <button onClick={() => { setForm(profile); setEditing(false); }} style={{
                                background: '#F3F4F6', color: '#4B5563', border: 'none',
                                padding: '1rem 2rem', borderRadius: '99px', fontSize: '1.1rem',
                                fontWeight: 700, cursor: 'pointer'
                            }}>
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setEditing(true)} style={{
                            background: '#111827', color: 'white', border: 'none',
                            padding: '1rem 2.5rem', borderRadius: '99px', fontSize: '1.1rem',
                            fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: '0 8px 20px -5px rgba(17,24,39,0.3)'
                        }}>
                            Edit Profile ✏️
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

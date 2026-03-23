import React, { useState, useEffect, useCallback } from 'react';

// Toast context and component
let toastSetter = null;

export function useToast() {
  return useCallback((message, type = 'success') => {
    if (toastSetter) toastSetter({ message, type, id: Date.now() });
  }, []);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastSetter = (toast) => setToasts(prev => [...prev, toast]);
    return () => { toastSetter = null; };
  }, []);

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => setToasts(prev => prev.slice(1)), 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const colors = {
    success: { bg: '#004F32', border: '#10B981', icon: '✓' },
    error: { bg: '#991B1B', border: '#EF4444', icon: '✕' },
    info: { bg: '#1E3A5F', border: '#3B82F6', icon: 'ℹ' },
  };

  return (
    <>
      {children}
      <div style={{
        position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 99999, 
        pointerEvents: 'none', width: '90%', maxWidth: '450px'
      }}>
        {toasts.map(t => {
          const c = colors[t.type] || colors.info;
          return (
            <div key={t.id} style={{
              background: c.bg, color: 'white', padding: '1.25rem 1.75rem',
              borderRadius: '16px', fontWeight: 700, fontSize: '1.05rem',
              display: 'flex', alignItems: 'center', gap: '1rem',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4)',
              borderLeft: `4px solid ${c.border}`,
              animation: 'slideUpFade 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
              pointerEvents: 'auto'
            }}>
              <span style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: c.border, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1rem', fontWeight: 900, flexShrink: 0
              }}>{c.icon}</span>
              {t.message}
            </div>
          );
        })}
      </div>
    </>
  );
}

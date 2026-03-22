import React, { useState } from 'react';

export default function PaymentsManager() {
  const [payments, setPayments] = useState([
    { id: 'PAY-8901', orderId: 'ORD-1235', student: 'student2@campus.edu', amount: 12.50, method: 'transfer', status: 'pending_verification', proof: 'receipt_123.jpg', date: '5 mins ago' },
    { id: 'PAY-8902', orderId: 'ORD-1111', student: 'student1@campus.edu', amount: 8.00, method: 'cash', status: 'pending', proof: null, date: '1 hour ago' }
  ]);

  return (
    <div>
      <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: '0 0 0.5rem' }}>Payments & Proofs</h2>
      <p style={{ color: '#64748b', marginBottom: '3rem' }}>Verify manual bank transfers and track cash payments.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {payments.map(pay => (
          <div key={pay.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{pay.id}</span>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{pay.date}</span>
            </div>
            <p style={{ margin: '0 0 0.5rem', color: '#334155' }}><strong>Order:</strong> {pay.orderId}</p>
            <p style={{ margin: '0 0 0.5rem', color: '#334155' }}><strong>Student:</strong> {pay.student}</p>
            <p style={{ margin: '0 0 0.5rem', color: '#334155' }}><strong>Amount:</strong> ${pay.amount.toFixed(2)}</p>
            <p style={{ margin: '0 0 1rem', color: '#334155' }}><strong>Method:</strong> {pay.method.toUpperCase()}</p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={badgeStyle(pay.status)}>{pay.status.replace('_', ' ').toUpperCase()}</span>
              {pay.status === 'pending_verification' && (
                <button style={btnApprove}>Verify Payment</button>
              )}
            </div>
            
            {pay.proof && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', textAlign: 'center' }}>
                <a href="#" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: '500' }}>View Uploaded Proof 📎</a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const badgeStyle = (status) => {
  let bg = '#f1f5f9', color = '#475569';
  if (status === 'pending_verification') { bg = '#fef3c7'; color = '#b45309'; }
  if (status === 'paid') { bg = '#dcfce7'; color = '#15803d'; }
  return { padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: bg, color };
};

const btnApprove = { padding: '0.5rem 1rem', border: 'none', background: '#10b981', color: 'white', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' };

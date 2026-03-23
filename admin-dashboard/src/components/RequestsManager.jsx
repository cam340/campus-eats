import React, { useState, useEffect } from 'react';
import { api, socket } from '../api';

export default function RequestsManager() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchReqs = async () => {
        try {
            const data = await api.admin.getRequests();
            setRequests(data);
        } catch(e) { console.error(e); }
    };
    fetchReqs();

    // Listen for live updates
    socket.on('new_request', fetchReqs);
    socket.on('request_updated', fetchReqs);

    return () => {
      socket.off('new_request', fetchReqs);
      socket.off('request_updated', fetchReqs);
    };
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: '0 0 0.5rem' }}>Active Requests</h2>
      <p style={{ color: '#64748b', marginBottom: '3rem' }}>Monitor all ongoing deliveries and Favor Points transactions.</p>
      
      <div style={{ overflowX: 'auto', background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
          <tr>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Cafeteria</th>
            <th style={thStyle}>Details</th>
            <th style={thStyle}>Est. Price</th>
            <th style={thStyle}>Budget</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req, i) => (
            <tr key={req.id} style={{ borderBottom: i === requests.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
              <td style={tdStyle}>
                  {new Date(req.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </td>
              <td style={tdStyle}>{req.cafeteria || 'N/A'}</td>
              <td style={tdStyle}>{req.request_text}</td>
              <td style={tdStyle}>₦{(req.estimated_price || 0).toLocaleString()}</td>
              <td style={tdStyle}><strong>{req.budget_range?.replace('$', '₦')}</strong></td>
              <td style={tdStyle}>
                <span style={badgeStyle(req.status)}>{req.status.replace('_', ' ').toUpperCase()}</span>
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
             <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No active requests found on the network.</td></tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

const thStyle = { padding: '1rem', color: '#334155', fontWeight: '600' };
const tdStyle = { padding: '1rem', color: '#0f172a' };

const badgeStyle = (status) => {
  let bg = '#f1f5f9', color = '#475569';
  if (status === 'request_sent') { bg = '#fef3c7'; color = '#b45309'; }
  if (status === 'accepted') { bg = '#dbeafe'; color = '#1d4ed8'; }
  if (status === 'delivered') { bg = '#dcfce7'; color = '#15803d'; }
  return { padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: bg, color };
};

import { useState, useEffect } from 'react';

const mockLocations = [
  { id: 1, name: 'Joseph Hall' },
  { id: 2, name: 'Levi Hall' },
  { id: 3, name: 'Esme Hall' },
  { id: 4, name: 'Babcock Library' },
];

function emitChange() {
  window.dispatchEvent(new Event('mock_db_change'));
  localStorage.setItem('mock_db_ping', Date.now()); // triggers cross-tab 'storage' event
}

export function useMockAuth() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('mock_user') || 'null'));
  
  useEffect(() => {
    const handleStorage = () => setUser(JSON.parse(localStorage.getItem('mock_user') || 'null'));
    window.addEventListener('storage', handleStorage);
    window.addEventListener('mock_auth_change', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('mock_auth_change', handleStorage);
    };
  }, []);

  const login = (role, fullName, extra) => {
    const u = { id: 'u_' + Date.now() + Math.random(), role, user_metadata: { full_name: fullName, ...extra } };
    localStorage.setItem('mock_user', JSON.stringify(u));
    window.dispatchEvent(new Event('mock_auth_change'));
    return u;
  };

  const logout = () => {
    localStorage.removeItem('mock_user');
    window.dispatchEvent(new Event('mock_auth_change'));
  };

  return { user, login, logout };
}

export function useMockData() {
  const [requests, setRequests] = useState(() => JSON.parse(localStorage.getItem('mock_requests') || '[]'));
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('mock_messages') || '[]'));

  useEffect(() => {
    const handleStorage = () => {
      setRequests(JSON.parse(localStorage.getItem('mock_requests') || '[]'));
      setMessages(JSON.parse(localStorage.getItem('mock_messages') || '[]'));
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('mock_db_change', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('mock_db_change', handleStorage);
    };
  }, []);

  const createRequest = (student_id, location_id, request_text, budget_range) => {
    const loc = mockLocations.find(l => parseInt(l.id) === parseInt(location_id)) || mockLocations[0];
    const r = { id: 'req_' + Date.now(), student_id, delivery_location_id: location_id, request_text, budget_range, status: 'request_sent', delivery_locations: loc };
    const all = JSON.parse(localStorage.getItem('mock_requests') || '[]');
    all.push(r);
    localStorage.setItem('mock_requests', JSON.stringify(all));
    emitChange();
    return r;
  };

  const updateRequestStatus = (id, status) => {
    const all = JSON.parse(localStorage.getItem('mock_requests') || '[]');
    const idx = all.findIndex(x => x.id === id);
    if(idx > -1) {
      all[idx].status = status;
      localStorage.setItem('mock_requests', JSON.stringify(all));
      emitChange();
    }
  };

  const sendMessage = (request_id, sender_id, content) => {
    const m = { id: 'msg_' + Date.now(), request_id, sender_id, content };
    const all = JSON.parse(localStorage.getItem('mock_messages') || '[]');
    all.push(m);
    localStorage.setItem('mock_messages', JSON.stringify(all));
    emitChange();
  };

  return { 
    locations: mockLocations, 
    requests, 
    messages, 
    createRequest, 
    updateRequestStatus, 
    sendMessage 
  };
}

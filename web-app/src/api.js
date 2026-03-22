import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const socket = io(SOCKET_URL);

// Simple fetch wrapper to handle JSON and errors cleanly
async function client(endpoint, { body, ...customConfig } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}/${endpoint}`, config);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API Request failed');
  }
  return data;
}

export const api = {
  auth: {
    signup: (userData) => client('auth/signup', { body: userData }),
    login: (credentials) => client('auth/login', { body: credentials }),
  },
  locations: {
    getAll: () => client('locations'),
  },
  requests: {
    getStudentActive: (studentId) => client(`requests/student/${studentId}`),
    getAvailable: () => client('requests/available'),
    create: (data) => client('requests', { body: data }),
    updateStatus: (requestId, status, riderId = null) => 
      client(`requests/${requestId}`, { method: 'PUT', body: { status, rider_id: riderId } }),
  },
  messages: {
    getByRequest: (requestId) => client(`messages/${requestId}`),
    send: (data) => client('messages', { body: data }),
  }
};

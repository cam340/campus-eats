import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const socket = io(SOCKET_URL);

async function client(endpoint, { body, method = 'GET' } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const config = { method, headers };

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
  admin: {
    getStats: () => client('admin/stats'),
    getUsers: () => client('admin/users'),
    updateUser: (id, preferences) => client(`admin/users/${id}`, { method: 'PATCH', body: { preferences } }),
    getLocations: () => client('admin/locations'),
    updateLocation: (id, is_active) => client(`admin/locations/${id}`, { method: 'PATCH', body: { is_active } }),
    getRequests: () => client('admin/requests'),
  }
};

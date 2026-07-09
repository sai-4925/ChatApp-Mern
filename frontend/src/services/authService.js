import api from './api';

export const registerRequest = (payload) => api.post('/auth/register', payload);

export const loginRequest = (payload) => api.post('/auth/login', payload);

export const logoutRequest = () => api.post('/auth/logout');

export const getCurrentUserRequest = () => api.get('/auth/me');

export const forgotPasswordRequest = (email) => api.post('/auth/forgot-password', { email });

export const resetPasswordRequest = (token, password) =>
  api.post('/auth/reset-password', { token, password });

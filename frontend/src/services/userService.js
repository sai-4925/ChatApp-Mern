import api from './api';

export const searchUsersRequest = (query) => api.get('/users/search', { params: { q: query } });

export const getUserProfileRequest = (userId) => api.get(`/users/${userId}`);

export const updateProfileRequest = (payload) => api.put('/users/me', payload);

export const updateAvatarRequest = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.put('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateSettingsRequest = (payload) => api.put('/users/me/settings', payload);

export const changePasswordRequest = (payload) => api.put('/users/me/password', payload);

export const blockUserRequest = (userId) => api.post(`/users/${userId}/block`);
export const unblockUserRequest = (userId) => api.delete(`/users/${userId}/block`);
export const getBlockedUsersRequest = () => api.get('/users/me/blocked');

export const addContactRequest = (userId) => api.post(`/users/${userId}/contact`);
export const removeContactRequest = (userId) => api.delete(`/users/${userId}/contact`);
export const getContactsRequest = () => api.get('/users/me/contacts');

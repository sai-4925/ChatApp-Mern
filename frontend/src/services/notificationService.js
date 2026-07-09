import api from './api';

export const getNotificationsRequest = (page = 1, limit = 20) =>
  api.get('/notifications', { params: { page, limit } });

export const getUnreadCountRequest = () => api.get('/notifications/unread-count');

export const markNotificationReadRequest = (notificationId) =>
  api.put(`/notifications/${notificationId}/read`);

export const markAllNotificationsReadRequest = () => api.put('/notifications/read-all');

export const deleteNotificationRequest = (notificationId) =>
  api.delete(`/notifications/${notificationId}`);

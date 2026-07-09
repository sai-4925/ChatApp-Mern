import api from './api';

export const getConversationsRequest = (filter = 'all') =>
  api.get('/conversations', { params: { filter } });

export const createConversationRequest = (participantId) =>
  api.post('/conversations', { participantId });

export const togglePinConversationRequest = (conversationId) =>
  api.put(`/conversations/${conversationId}/pin`);

export const toggleArchiveConversationRequest = (conversationId) =>
  api.put(`/conversations/${conversationId}/archive`);

export const setMuteConversationRequest = (conversationId, until) =>
  api.put(`/conversations/${conversationId}/mute`, { until });

export const setWallpaperRequest = (conversationId, url) =>
  api.put(`/conversations/${conversationId}/wallpaper`, { url });

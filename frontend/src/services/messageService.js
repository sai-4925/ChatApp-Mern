import api from './api';

export const getMessagesRequest = (conversationId, page = 1, limit = 20) =>
  api.get(`/messages/${conversationId}`, { params: { page, limit } });

export const sendTextMessageRequest = ({ conversationId, content, replyTo, mentions }) =>
  api.post('/messages', { conversationId, content, type: 'text', replyTo, mentions });

export const sendMediaMessageRequest = ({ conversationId, file, type, replyTo }) => {
  const formData = new FormData();
  formData.append('conversationId', conversationId);
  formData.append('type', type);
  formData.append('media', file);
  if (replyTo) formData.append('replyTo', replyTo);

  return api.post('/messages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const editMessageRequest = (messageId, content) =>
  api.put(`/messages/${messageId}`, { content });

export const deleteForMeRequest = (messageId) => api.delete(`/messages/${messageId}/me`);
export const deleteForEveryoneRequest = (messageId) => api.delete(`/messages/${messageId}/everyone`);

export const toggleReactionRequest = (messageId, emoji) =>
  api.post(`/messages/${messageId}/react`, { emoji });

export const toggleStarRequest = (messageId) => api.post(`/messages/${messageId}/star`);
export const getStarredMessagesRequest = () => api.get('/messages/starred/me');

export const forwardMessageRequest = (messageId, conversationIds) =>
  api.post(`/messages/${messageId}/forward`, { conversationIds });

export const searchMessagesRequest = (conversationId, query) =>
  api.get(`/messages/${conversationId}/search`, { params: { q: query } });

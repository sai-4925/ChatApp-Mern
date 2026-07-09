import api from './api';

export const createGroupRequest = ({ name, description, memberIds }) =>
  api.post('/groups', { name, description, memberIds });

export const getGroupRequest = (groupId) => api.get(`/groups/${groupId}`);

export const updateGroupRequest = (groupId, payload) => api.put(`/groups/${groupId}`, payload);

export const updateGroupAvatarRequest = (groupId, file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.put(`/groups/${groupId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const addGroupMembersRequest = (groupId, memberIds) =>
  api.post(`/groups/${groupId}/members`, { memberIds });

export const removeGroupMemberRequest = (groupId, memberId) =>
  api.delete(`/groups/${groupId}/members/${memberId}`);

export const promoteToAdminRequest = (groupId, memberId) =>
  api.put(`/groups/${groupId}/members/${memberId}/promote`);

export const demoteAdminRequest = (groupId, memberId) =>
  api.put(`/groups/${groupId}/members/${memberId}/demote`);

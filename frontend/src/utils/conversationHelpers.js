/**
 * For a 1:1 conversation, returns the "other" participant (not the current
 * user). For groups, returns null — callers should use conversation.group instead.
 */
export const getOtherParticipant = (conversation, currentUserId) => {
  if (!conversation || conversation.isGroup) return null;
  return conversation.participants.find((p) => p._id !== currentUserId) || null;
};

export const getConversationDisplayName = (conversation, currentUserId) => {
  if (conversation.isGroup) return conversation.group?.name || 'Group';
  const other = getOtherParticipant(conversation, currentUserId);
  return other?.name || 'Unknown user';
};

export const getConversationAvatar = (conversation, currentUserId) => {
  if (conversation.isGroup) return conversation.group?.avatar?.url;
  const other = getOtherParticipant(conversation, currentUserId);
  return other?.avatar?.url;
};

export const getUnreadCountForUser = (conversation, userId) => {
  const entry = conversation.unreadCounts?.find((u) => u.user === userId || u.user?._id === userId);
  return entry?.count || 0;
};

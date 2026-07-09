import { Pin } from 'lucide-react';
import Avatar from '../common/Avatar';
import useAuth from '../../hooks/useAuth';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import {
  getConversationDisplayName,
  getConversationAvatar,
  getOtherParticipant,
  getUnreadCountForUser,
} from '../../utils/conversationHelpers';
import { formatChatListTime } from '../../utils/dateHelpers';

const ChatListItem = ({ conversation, isActive, onClick }) => {
  const { user } = useAuth();
  const otherParticipant = getOtherParticipant(conversation, user._id);
  const isOnline = useOnlineStatus(otherParticipant?._id);

  const name = getConversationDisplayName(conversation, user._id);
  const avatarUrl = getConversationAvatar(conversation, user._id);
  const unreadCount = getUnreadCountForUser(conversation, user._id);
  const isPinned = conversation.pinnedBy?.some((id) => id === user._id || id?._id === user._id);

  const lastMessage = conversation.lastMessage;
  const lastMessagePreview = lastMessage
    ? lastMessage.deletedForEveryone
      ? 'This message was deleted'
      : lastMessage.type === 'text'
      ? lastMessage.content
      : `Sent a ${lastMessage.type}`
    : 'Say hello 👋';

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
        isActive
          ? 'bg-primary-500/10 dark:bg-primary-500/20'
          : 'hover:bg-black/[0.03] dark:hover:bg-white/5'
      }`}
    >
      <Avatar src={avatarUrl} name={name} showStatus={!conversation.isGroup} isOnline={isOnline} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-medium text-ink-light dark:text-ink-dark">{name}</p>
          <span className="shrink-0 text-xs text-muted-light dark:text-muted-dark">
            {lastMessage && formatChatListTime(lastMessage.createdAt || conversation.lastActivity)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm text-muted-light dark:text-muted-dark">
            {lastMessagePreview}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            {isPinned && <Pin size={12} className="text-muted-light dark:text-muted-dark" />}
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1.5 text-xs font-semibold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export default ChatListItem;

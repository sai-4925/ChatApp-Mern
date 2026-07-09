import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Pin, Archive } from 'lucide-react';
import Avatar from '../common/Avatar';
import { MessageSkeleton } from '../common/Skeletons';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import DateDivider from './DateDivider';
import TypingIndicator from './TypingIndicator';
import ForwardMessageModal from '../modals/ForwardMessageModal';
import useChat from '../../hooks/useChat';
import useAuth from '../../hooks/useAuth';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import {
  getConversationDisplayName,
  getConversationAvatar,
  getOtherParticipant,
} from '../../utils/conversationHelpers';
import { groupMessagesByDate, formatLastSeen } from '../../utils/dateHelpers';
import {
  editMessageRequest,
  deleteForMeRequest,
  deleteForEveryoneRequest,
  toggleReactionRequest,
  toggleStarRequest,
} from '../../services/messageService';
import {
  togglePinConversationRequest,
  toggleArchiveConversationRequest,
} from '../../services/conversationService';

const ChatWindow = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    conversations,
    messages,
    openConversation,
    closeConversation,
    sendMessage,
    emitTyping,
    typingUserIds,
    refreshConversations,
  } = useChat();

  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [forwardingMessage, setForwardingMessage] = useState(null);

  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  const conversation = conversations.find((c) => c._id === conversationId);
  const otherParticipant = conversation ? getOtherParticipant(conversation, user._id) : null;
  const isOtherOnline = useOnlineStatus(otherParticipant?._id);

  useEffect(() => {
    if (!conversationId) return;
    setIsLoadingMessages(true);
    openConversation(conversationId).finally(() => setIsLoadingMessages(false));

    return () => closeConversation(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = useCallback(
    (content, options) => sendMessage(conversationId, content, options),
    [conversationId, sendMessage]
  );

  const handleReact = async (messageId, emoji) => {
    try {
      await toggleReactionRequest(messageId, emoji);
    } catch (error) {
      toast.error('Could not react to message');
    }
  };

  const handleStar = async (messageId) => {
    try {
      await toggleStarRequest(messageId);
      toast.success('Updated starred messages');
    } catch (error) {
      toast.error('Could not star message');
    }
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      await deleteForMeRequest(messageId);
    } catch (error) {
      toast.error('Could not delete message');
    }
  };

  const handleDeleteForEveryone = async (messageId) => {
    try {
      await deleteForEveryoneRequest(messageId);
    } catch (error) {
      toast.error('Could not delete message for everyone');
    }
  };

  const handleEditSave = async () => {
    if (!editText.trim()) return;
    try {
      await editMessageRequest(editingMessage._id, editText.trim());
      setEditingMessage(null);
      setEditText('');
    } catch (error) {
      toast.error('Could not edit message');
    }
  };

  const handleTogglePin = async () => {
    await togglePinConversationRequest(conversationId);
    refreshConversations();
  };

  const handleToggleArchive = async () => {
    await toggleArchiveConversationRequest(conversationId);
    refreshConversations();
    navigate('/chat');
  };

  if (!conversationId || !conversation) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center bg-canvas-light text-center dark:bg-canvas-dark">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
          💬
        </div>
        <p className="mt-4 font-display text-lg text-ink-light dark:text-ink-dark">
          Select a conversation
        </p>
        <p className="mt-1 text-sm text-muted-light dark:text-muted-dark">
          Choose a chat from the sidebar, or start a new one.
        </p>
      </div>
    );
  }

  const displayName = getConversationDisplayName(conversation, user._id);
  const avatarUrl = getConversationAvatar(conversation, user._id);
  const groupedMessages = groupMessagesByDate(messages);
  const typingNames = conversation.isGroup
    ? conversation.participants.filter((p) => typingUserIds.has(p._id)).map((p) => p.name)
    : typingUserIds.has(otherParticipant?._id)
    ? [otherParticipant?.name]
    : [];

  return (
    <div className="flex h-full flex-1 flex-col bg-canvas-light dark:bg-canvas-dark">
      <div className="flex items-center justify-between border-b border-black/5 bg-surface-light px-4 py-3 dark:border-white/5 dark:bg-surface-dark">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/chat')}
            className="rounded-lg p-1.5 text-muted-light hover:bg-black/5 dark:text-muted-dark dark:hover:bg-white/10 lg:hidden"
          >
            <ArrowLeft size={18} />
          </button>
          <Avatar src={avatarUrl} name={displayName} showStatus={!conversation.isGroup} isOnline={isOtherOnline} />
          <div>
            <p className="font-medium text-ink-light dark:text-ink-dark">{displayName}</p>
            <p className="text-xs text-muted-light dark:text-muted-dark">
              {conversation.isGroup
                ? `${conversation.participants.length} members`
                : isOtherOnline
                ? 'Online'
                : formatLastSeen(otherParticipant?.lastSeen)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleTogglePin}
            aria-label="Pin conversation"
            className="rounded-lg p-2 text-muted-light hover:bg-black/5 dark:text-muted-dark dark:hover:bg-white/10"
          >
            <Pin size={17} />
          </button>
          <button
            onClick={handleToggleArchive}
            aria-label="Archive conversation"
            className="rounded-lg p-2 text-muted-light hover:bg-black/5 dark:text-muted-dark dark:hover:bg-white/10"
          >
            <Archive size={17} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3">
        {isLoadingMessages ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-light dark:text-muted-dark">
            No messages yet. Say hello
          </p>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              <DateDivider date={group.date} />
              {group.messages.map((message, idx) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwn={message.sender?._id === user._id}
                  showSender={conversation.isGroup && idx === 0}
                  onReply={setReplyingTo}
                  onReact={handleReact}
                  onStar={handleStar}
                  onEdit={(m) => {
                    setEditingMessage(m);
                    setEditText(m.content);
                  }}
                  onDeleteForMe={handleDeleteForMe}
                  onDeleteForEveryone={handleDeleteForEveryone}
                  onForward={setForwardingMessage}
                />
              ))}
            </div>
          ))
        )}

        {typingNames.length > 0 && <TypingIndicator name={typingNames.join(', ')} />}
        <div ref={bottomRef} />
      </div>

      {editingMessage && (
        <div className="border-t border-black/5 bg-surface-light px-4 py-2 dark:border-white/5 dark:bg-surface-dark">
          <p className="mb-1 text-xs font-medium text-primary-600 dark:text-primary-300">Editing message</p>
          <div className="flex gap-2">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 rounded-xl border border-black/10 bg-canvas-light px-3 py-2 text-sm dark:border-white/10 dark:bg-canvas-dark dark:text-ink-dark"
              autoFocus
            />
            <button onClick={handleEditSave} className="rounded-xl bg-primary-500 px-3 py-2 text-sm text-white">
              Save
            </button>
            <button
              onClick={() => setEditingMessage(null)}
              className="rounded-xl bg-black/5 px-3 py-2 text-sm dark:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <MessageInput
        conversationId={conversationId}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onSend={handleSend}
        onTyping={(isTyping) => emitTyping(conversationId, isTyping)}
      />

      <ForwardMessageModal
        isOpen={!!forwardingMessage}
        onClose={() => setForwardingMessage(null)}
        message={forwardingMessage}
      />
    </div>
  );
};

export default ChatWindow;

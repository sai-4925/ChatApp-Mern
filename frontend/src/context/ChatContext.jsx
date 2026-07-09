import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SocketContext } from './SocketContext';
import { AuthContext } from './AuthContext';
import { getConversationsRequest, createConversationRequest } from '../services/conversationService';
import { getMessagesRequest, sendTextMessageRequest } from '../services/messageService';

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { socket } = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [typingByConversation, setTypingByConversation] = useState({});
  const [loadingConversations, setLoadingConversations] = useState(true);

  const activeConversationRef = useRef(null);
  activeConversationRef.current = activeConversationId;

  const refreshConversations = useCallback(async (filter = 'all') => {
    setLoadingConversations(true);
    try {
      const { data } = await getConversationsRequest(filter);
      setConversations(data.conversations);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    if (user) refreshConversations();
  }, [user, refreshConversations]);

  const loadMessages = useCallback(async (conversationId, page = 1) => {
    const { data } = await getMessagesRequest(conversationId, page);
    setMessagesByConversation((prev) => ({
      ...prev,
      [conversationId]:
        page === 1 ? data.messages : [...data.messages, ...(prev[conversationId] || [])],
    }));
    return data.messages;
  }, []);

  const openConversation = useCallback(
    async (conversationId) => {
      setActiveConversationId(conversationId);
      socket?.emit('join room', { conversationId });

      if (!messagesByConversation[conversationId]) {
        await loadMessages(conversationId);
      }
    },
    [socket, messagesByConversation, loadMessages]
  );

  const closeConversation = useCallback(
    (conversationId) => {
      socket?.emit('leave room', { conversationId });
      if (activeConversationId === conversationId) setActiveConversationId(null);
    },
    [socket, activeConversationId]
  );

  const startConversationWith = useCallback(
    async (participantId) => {
      const { data } = await createConversationRequest(participantId);
      await refreshConversations();
      return data.conversation;
    },
    [refreshConversations]
  );

  const sendMessage = useCallback(
    async (conversationId, content, options = {}) => {
      return new Promise((resolve, reject) => {
        if (!socket) {
          sendTextMessageRequest({ conversationId, content, ...options })
            .then((res) => resolve(res.data.message))
            .catch(reject);
          return;
        }

        socket.emit(
          'send message',
          { conversationId, content, type: 'text', ...options },
          (ack) => {
            if (ack?.success) resolve(ack.message);
            else reject(new Error(ack?.message || 'Failed to send message'));
          }
        );
      });
    },
    [socket]
  );

  const emitTyping = useCallback(
    (conversationId, isTyping) => {
      socket?.emit(isTyping ? 'typing' : 'stop typing', { conversationId });
    },
    [socket]
  );

  const upsertMessage = useCallback((conversationId, message) => {
    setMessagesByConversation((prev) => {
      const existing = prev[conversationId] || [];
      const index = existing.findIndex((m) => m._id === message._id);
      const next =
        index > -1
          ? existing.map((m) => (m._id === message._id ? message : m))
          : [...existing, message];
      return { ...prev, [conversationId]: next };
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      upsertMessage(message.conversation, message);
      refreshConversations();
    };

    const handleMessageEdited = (message) => upsertMessage(message.conversation, message);

    const handleMessageDeleted = ({ messageId }) => {
      setMessagesByConversation((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((cid) => {
          next[cid] = next[cid].map((m) =>
            m._id === messageId ? { ...m, deletedForEveryone: true, content: '' } : m
          );
        });
        return next;
      });
    };

    const handleReaction = ({ messageId, reactions }) => {
      setMessagesByConversation((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((cid) => {
          next[cid] = next[cid].map((m) => (m._id === messageId ? { ...m, reactions } : m));
        });
        return next;
      });
    };

    const handleTyping = ({ conversationId, userId }) => {
      setTypingByConversation((prev) => ({
        ...prev,
        [conversationId]: new Set(prev[conversationId]).add(userId),
      }));
    };

    const handleStopTyping = ({ conversationId, userId }) => {
      setTypingByConversation((prev) => {
        const next = new Set(prev[conversationId]);
        next.delete(userId);
        return { ...prev, [conversationId]: next };
      });
    };

    socket.on('receive message', handleReceiveMessage);
    socket.on('message edited', handleMessageEdited);
    socket.on('message deleted', handleMessageDeleted);
    socket.on('message reaction', handleReaction);
    socket.on('typing', handleTyping);
    socket.on('stop typing', handleStopTyping);

    return () => {
      socket.off('receive message', handleReceiveMessage);
      socket.off('message edited', handleMessageEdited);
      socket.off('message deleted', handleMessageDeleted);
      socket.off('message reaction', handleReaction);
      socket.off('typing', handleTyping);
      socket.off('stop typing', handleStopTyping);
    };
  }, [socket, upsertMessage, refreshConversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        loadingConversations,
        activeConversationId,
        messages: messagesByConversation[activeConversationId] || [],
        messagesByConversation,
        typingUserIds: typingByConversation[activeConversationId] || new Set(),
        refreshConversations,
        openConversation,
        closeConversation,
        startConversationWith,
        sendMessage,
        emitTyping,
        loadMessages,
        upsertMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import useChat from '../../hooks/useChat';
import useAuth from '../../hooks/useAuth';
import { forwardMessageRequest } from '../../services/messageService';
import { getConversationDisplayName, getConversationAvatar } from '../../utils/conversationHelpers';

const ForwardMessageModal = ({ isOpen, onClose, message }) => {
  const { conversations } = useChat();
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const toggle = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleForward = async () => {
    if (selectedIds.length === 0) return;
    setIsSending(true);
    try {
      await forwardMessageRequest(message._id, selectedIds);
      toast.success('Message forwarded');
      setSelectedIds([]);
      onClose();
    } catch (error) {
      toast.error('Could not forward message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Forward message">
      <div className="max-h-72 space-y-1 overflow-y-auto">
        {conversations.map((c) => {
          const isSelected = selectedIds.includes(c._id);
          return (
            <button
              key={c._id}
              onClick={() => toggle(c._id)}
              className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left ${
                isSelected ? 'bg-primary-500/10' : 'hover:bg-black/[0.03] dark:hover:bg-white/5'
              }`}
            >
              <Avatar
                src={getConversationAvatar(c, user._id)}
                name={getConversationDisplayName(c, user._id)}
                size="sm"
              />
              <p className="truncate text-sm font-medium text-ink-light dark:text-ink-dark">
                {getConversationDisplayName(c, user._id)}
              </p>
              {isSelected && <span className="ml-auto text-primary-500">✓</span>}
            </button>
          );
        })}
      </div>

      <Button fullWidth className="mt-4" isLoading={isSending} disabled={selectedIds.length === 0} onClick={handleForward}>
        Forward to {selectedIds.length || ''} chat{selectedIds.length === 1 ? '' : 's'}
      </Button>
    </Modal>
  );
};

export default ForwardMessageModal;

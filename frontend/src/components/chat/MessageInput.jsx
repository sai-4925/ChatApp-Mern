import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X, Mic } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';
import { sendMediaMessageRequest } from '../../services/messageService';

const inferMediaType = (mimeType) => {
  if (mimeType.startsWith('image')) return 'image';
  if (mimeType.startsWith('video')) return 'video';
  if (mimeType.startsWith('audio')) return 'audio';
  return 'document';
};

const MessageInput = ({ conversationId, replyingTo, onCancelReply, onSend, onTyping }) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);

  const handleTextChange = (e) => {
    setText(e.target.value);

    onTyping?.(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping?.(false), 1500);
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setText('');
    onCancelReply?.();
    onTyping?.(false);
    try {
      await onSend(trimmed, { replyTo: replyingTo?._id });
    } catch (error) {
      toast.error('Message failed to send');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await sendMediaMessageRequest({
        conversationId,
        file,
        type: inferMediaType(file.type),
        replyTo: replyingTo?._id,
      });
      onCancelReply?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="border-t border-black/5 bg-surface-light px-4 py-3 dark:border-white/5 dark:bg-surface-dark">
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-black/5 px-3 py-2 text-sm dark:bg-white/5">
          <div className="min-w-0">
            <p className="font-medium text-primary-600 dark:text-primary-300">
              Replying to {replyingTo.sender?.name}
            </p>
            <p className="truncate text-muted-light dark:text-muted-dark">
              {replyingTo.content || `A ${replyingTo.type}`}
            </p>
          </div>
          <button onClick={onCancelReply} aria-label="Cancel reply">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="relative flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          aria-label="Attach file"
          className="rounded-full p-2.5 text-muted-light hover:bg-black/5 disabled:opacity-50 dark:text-muted-dark dark:hover:bg-white/10"
        >
          <Paperclip size={19} />
        </button>

        <button
          onClick={() => setShowEmojiPicker((v) => !v)}
          aria-label="Emoji picker"
          className="rounded-full p-2.5 text-muted-light hover:bg-black/5 dark:text-muted-dark dark:hover:bg-white/10"
        >
          <Smile size={19} />
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-14 left-0 z-20">
            <EmojiPicker onEmojiClick={handleEmojiClick} height={350} />
          </div>
        )}

        <textarea
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={isUploading ? 'Uploading...' : 'Type a message'}
          rows={1}
          disabled={isUploading}
          className="max-h-32 flex-1 resize-none rounded-2xl border border-black/10 bg-canvas-light px-4 py-2.5 text-sm text-ink-light placeholder:text-muted-light focus:border-primary-500 focus:outline-none dark:border-white/10 dark:bg-canvas-dark dark:text-ink-dark dark:placeholder:text-muted-dark"
        />

        {text.trim() ? (
          <button
            onClick={handleSend}
            aria-label="Send message"
            className="relative overflow-hidden rounded-full bg-primary-500 p-2.5 text-white hover:bg-primary-600"
          >
            <Send size={18} />
          </button>
        ) : (
          <button
            aria-label="Record voice message"
            className="rounded-full p-2.5 text-muted-light hover:bg-black/5 dark:text-muted-dark dark:hover:bg-white/10"
          >
            <Mic size={19} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;

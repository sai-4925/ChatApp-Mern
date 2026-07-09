import { useState } from 'react';
import { Check, CheckCheck, Reply, Star, MoreHorizontal, Smile, Forward, Pencil, Trash2 } from 'lucide-react';
import { formatMessageTime } from '../../utils/dateHelpers';
import { QUICK_REACTIONS } from '../../constants';

const StatusTicks = ({ status }) => {
  if (status === 'seen') return <CheckCheck size={14} className="text-mint-500" />;
  if (status === 'delivered') return <CheckCheck size={14} className="text-white/70" />;
  return <Check size={14} className="text-white/70" />;
};

const MediaContent = ({ message }) => {
  const { type, media } = message;
  if (type === 'image') {
    return <img src={media.url} alt="Shared" className="max-w-xs rounded-xl" loading="lazy" />;
  }
  if (type === 'video') {
    return <video src={media.url} controls className="max-w-xs rounded-xl" />;
  }
  if (type === 'audio') {
    return <audio src={media.url} controls className="w-64" />;
  }
  // document
  return (
    <a
      href={media.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-xl bg-black/10 px-3 py-2 text-sm underline"
    >
      📄 {media.fileName || 'Document'}
    </a>
  );
};

const MessageBubble = ({
  message,
  isOwn,
  showSender,
  onReply,
  onReact,
  onStar,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
  onForward,
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (message.deletedForEveryone) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-4 py-1`}>
        <div className="rounded-2xl bg-black/5 px-4 py-2 text-sm italic text-muted-light dark:bg-white/5 dark:text-muted-dark">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex px-4 py-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[75%] flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {showSender && !isOwn && (
          <p className="mb-0.5 px-1 text-xs font-medium text-primary-600 dark:text-primary-300">
            {message.sender?.name}
          </p>
        )}

        <div className="relative flex items-center gap-1.5">
          {isOwn && (
            <div className="hidden items-center gap-0.5 group-hover:flex">
              <MessageActionButton icon={<MoreHorizontal size={15} />} onClick={() => setShowMenu((v) => !v)} />
            </div>
          )}
          {!isOwn && (
            <div className="hidden items-center gap-0.5 group-hover:flex">
              <MessageActionButton icon={<Reply size={15} />} onClick={() => onReply(message)} />
              <MessageActionButton icon={<Smile size={15} />} onClick={() => setShowReactionPicker((v) => !v)} />
              <MessageActionButton icon={<MoreHorizontal size={15} />} onClick={() => setShowMenu((v) => !v)} />
            </div>
          )}

          <div
            className={`rounded-bubble-received px-3.5 py-2 text-sm shadow-sm ${
              isOwn
                ? 'rounded-bubble-sent bg-primary-500 text-white'
                : 'bg-surface-light text-ink-light dark:bg-white/10 dark:text-ink-dark'
            }`}
          >
            {message.replyTo && (
              <div
                className={`mb-1.5 rounded-lg border-l-2 px-2 py-1 text-xs ${
                  isOwn ? 'border-white/50 bg-white/10' : 'border-primary-400 bg-black/5 dark:bg-white/5'
                }`}
              >
                <p className="font-medium">{message.replyTo.sender?.name}</p>
                <p className="truncate opacity-80">{message.replyTo.content || `A ${message.replyTo.type}`}</p>
              </div>
            )}

            {message.type !== 'text' && message.media && <MediaContent message={message} />}
            {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}

            <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isOwn ? 'text-white/70' : 'text-muted-light dark:text-muted-dark'}`}>
              {message.isEdited && <span className="italic">edited</span>}
              <span className="font-mono">{formatMessageTime(message.createdAt)}</span>
              {isOwn && <StatusTicks status={message.status} />}
            </div>
          </div>

          {isOwn && (
            <div className="hidden items-center gap-0.5 group-hover:flex">
              <MessageActionButton icon={<Smile size={15} />} onClick={() => setShowReactionPicker((v) => !v)} />
              <MessageActionButton icon={<Reply size={15} />} onClick={() => onReply(message)} />
            </div>
          )}

          {showReactionPicker && (
            <div className="absolute -top-10 z-10 flex gap-1 rounded-full bg-surface-light px-2 py-1 shadow-lg dark:bg-surface-dark">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(message._id, emoji);
                    setShowReactionPicker(false);
                  }}
                  className="rounded-full p-1 text-lg hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {showMenu && (
            <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-xl bg-surface-light py-1 text-sm shadow-lg dark:bg-surface-dark">
              <MenuItem icon={<Star size={14} />} label="Star" onClick={() => { onStar(message._id); setShowMenu(false); }} />
              <MenuItem icon={<Forward size={14} />} label="Forward" onClick={() => { onForward(message); setShowMenu(false); }} />
              {isOwn && message.type === 'text' && (
                <MenuItem icon={<Pencil size={14} />} label="Edit" onClick={() => { onEdit(message); setShowMenu(false); }} />
              )}
              <MenuItem icon={<Trash2 size={14} />} label="Delete for me" onClick={() => { onDeleteForMe(message._id); setShowMenu(false); }} />
              {isOwn && (
                <MenuItem
                  icon={<Trash2 size={14} />}
                  label="Delete for everyone"
                  danger
                  onClick={() => { onDeleteForEveryone(message._id); setShowMenu(false); }}
                />
              )}
            </div>
          )}
        </div>

        {message.reactions?.length > 0 && (
          <div className="mt-1 flex gap-1 px-1">
            {Object.entries(
              message.reactions.reduce((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                return acc;
              }, {})
            ).map(([emoji, count]) => (
              <span
                key={emoji}
                className="rounded-full bg-black/5 px-1.5 py-0.5 text-xs dark:bg-white/10"
              >
                {emoji} {count > 1 && count}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MessageActionButton = ({ icon, onClick }) => (
  <button
    onClick={onClick}
    className="rounded-full p-1.5 text-muted-light hover:bg-black/5 dark:text-muted-dark dark:hover:bg-white/10"
  >
    {icon}
  </button>
);

const MenuItem = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/10 ${
      danger ? 'text-accent-600 dark:text-accent-400' : 'text-ink-light dark:text-ink-dark'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default MessageBubble;

import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, SquarePen, Users, Settings as SettingsIcon } from 'lucide-react';
import ChatListItem from './ChatListItem';
import Avatar from '../common/Avatar';
import { ChatListSkeleton } from '../common/Skeletons';
import NewChatModal from '../modals/NewChatModal';
import NewGroupModal from '../modals/NewGroupModal';
import useChat from '../../hooks/useChat';
import useAuth from '../../hooks/useAuth';
import { getConversationDisplayName } from '../../utils/conversationHelpers';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'archived', label: 'Archived' },
];

const Sidebar = () => {
  const { conversations, loadingConversations, refreshConversations } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId: activeId } = useParams();

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    refreshConversations(tab);
  };

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) =>
      getConversationDisplayName(c, user._id).toLowerCase().includes(q)
    );
  }, [conversations, search, user._id]);

  return (
    <aside className="flex h-full w-full flex-col border-r border-black/5 bg-surface-light dark:border-white/5 dark:bg-surface-dark">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <button onClick={() => navigate('/profile')} aria-label="Your profile">
          <Avatar src={user.avatar?.url} name={user.name} size="sm" />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsNewGroupOpen(true)}
            aria-label="New group"
            className="rounded-lg p-2 text-muted-light hover:bg-black/5 dark:text-muted-dark dark:hover:bg-white/10"
          >
            <Users size={19} />
          </button>
          <button
            onClick={() => setIsNewChatOpen(true)}
            aria-label="New chat"
            className="rounded-lg p-2 text-muted-light hover:bg-black/5 dark:text-muted-dark dark:hover:bg-white/10"
          >
            <SquarePen size={19} />
          </button>
          <button
            onClick={() => navigate('/settings')}
            aria-label="Settings"
            className="rounded-lg p-2 text-muted-light hover:bg-black/5 dark:text-muted-dark dark:hover:bg-white/10"
          >
            <SettingsIcon size={19} />
          </button>
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 rounded-xl bg-canvas-light px-3 py-2 dark:bg-canvas-dark">
          <Search size={16} className="text-muted-light dark:text-muted-dark" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats"
            className="w-full bg-transparent text-sm text-ink-light placeholder:text-muted-light focus:outline-none dark:text-ink-dark dark:placeholder:text-muted-dark"
          />
        </div>
      </div>

      <div className="flex gap-1 px-4 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-500 text-white'
                : 'text-muted-light hover:bg-black/5 dark:text-muted-dark dark:hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {loadingConversations ? (
          <ChatListSkeleton />
        ) : filteredConversations.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-light dark:text-muted-dark">
            {search ? 'No matching chats' : 'No conversations yet, start one!'}
          </p>
        ) : (
          <div className="space-y-0.5">
            {filteredConversations.map((c) => (
              <ChatListItem
                key={c._id}
                conversation={c}
                isActive={c._id === activeId}
                onClick={() => navigate(`/chat/${c._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
      <NewGroupModal isOpen={isNewGroupOpen} onClose={() => setIsNewGroupOpen(false)} />
    </aside>
  );
};

export default Sidebar;

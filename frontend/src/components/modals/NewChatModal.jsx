import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Avatar from '../common/Avatar';
import useDebounce from '../../hooks/useDebounce';
import useChat from '../../hooks/useChat';
import { searchUsersRequest } from '../../services/userService';

const NewChatModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 350);
  const { startConversationWith } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    searchUsersRequest(debouncedQuery)
      .then(({ data }) => setResults(data.users))
      .catch(() => setResults([]))
      .finally(() => setIsSearching(false));
  }, [debouncedQuery]);

  const handleSelectUser = async (userId) => {
    try {
      const conversation = await startConversationWith(userId);
      onClose();
      setQuery('');
      navigate(`/chat/${conversation._id}`);
    } catch (error) {
      toast.error('Could not start conversation');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New chat">
      <Input
        placeholder="Search by name, username, or email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      <div className="mt-4 max-h-72 space-y-1 overflow-y-auto">
        {isSearching && (
          <p className="py-4 text-center text-sm text-muted-light dark:text-muted-dark">
            Searching...
          </p>
        )}

        {!isSearching && debouncedQuery && results.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-light dark:text-muted-dark">
            No users found for "{debouncedQuery}"
          </p>
        )}

        {results.map((u) => (
          <button
            key={u._id}
            onClick={() => handleSelectUser(u._id)}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-black/[0.03] dark:hover:bg-white/5"
          >
            <Avatar src={u.avatar?.url} name={u.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink-light dark:text-ink-dark">
                {u.name}
              </p>
              <p className="truncate text-xs text-muted-light dark:text-muted-dark">
                @{u.username}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
};

export default NewChatModal;

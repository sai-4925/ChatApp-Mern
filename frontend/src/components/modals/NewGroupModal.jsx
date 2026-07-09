import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import useDebounce from '../../hooks/useDebounce';
import useChat from '../../hooks/useChat';
import { searchUsersRequest } from '../../services/userService';
import { createGroupRequest } from '../../services/groupService';

const NewGroupModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('members'); // 'members' | 'details'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const debouncedQuery = useDebounce(query, 350);
  const { refreshConversations } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    searchUsersRequest(debouncedQuery)
      .then(({ data }) => setResults(data.users))
      .catch(() => setResults([]));
  }, [debouncedQuery]);

  const toggleMember = (user) => {
    setSelectedMembers((prev) =>
      prev.some((m) => m._id === user._id)
        ? prev.filter((m) => m._id !== user._id)
        : [...prev, user]
    );
  };

  const handleClose = () => {
    setStep('members');
    setQuery('');
    setResults([]);
    setSelectedMembers([]);
    setGroupName('');
    onClose();
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error('Give your group a name');
      return;
    }

    setIsCreating(true);
    try {
      const { data } = await createGroupRequest({
        name: groupName,
        memberIds: selectedMembers.map((m) => m._id),
      });
      await refreshConversations();
      handleClose();
      navigate(`/chat/${data.conversation._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create group');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={step === 'members' ? 'Add members' : 'Name your group'}>
      {step === 'members' ? (
        <>
          {selectedMembers.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedMembers.map((m) => (
                <span
                  key={m._id}
                  className="flex items-center gap-1 rounded-full bg-primary-100 py-1 pl-1 pr-2 text-xs font-medium text-primary-700 dark:bg-primary-900/50 dark:text-primary-200"
                >
                  <Avatar src={m.avatar?.url} name={m.name} size="sm" className="h-5 w-5 text-[10px]" />
                  {m.name}
                  <button onClick={() => toggleMember(m)} aria-label={`Remove ${m.name}`}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <Input
            placeholder="Search people to add"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          <div className="mt-3 max-h-56 space-y-1 overflow-y-auto">
            {results.map((u) => {
              const isSelected = selectedMembers.some((m) => m._id === u._id);
              return (
                <button
                  key={u._id}
                  onClick={() => toggleMember(u)}
                  className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left ${
                    isSelected ? 'bg-primary-500/10' : 'hover:bg-black/[0.03] dark:hover:bg-white/5'
                  }`}
                >
                  <Avatar src={u.avatar?.url} name={u.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-light dark:text-ink-dark">
                      {u.name}
                    </p>
                    <p className="truncate text-xs text-muted-light dark:text-muted-dark">
                      @{u.username}
                    </p>
                  </div>
                  {isSelected && <span className="text-primary-500">✓</span>}
                </button>
              );
            })}
          </div>

          <Button
            fullWidth
            className="mt-4"
            disabled={selectedMembers.length === 0}
            onClick={() => setStep('details')}
          >
            Next ({selectedMembers.length} selected)
          </Button>
        </>
      ) : (
        <>
          <Input
            label="Group name"
            placeholder="e.g. Weekend Trip Crew"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            autoFocus
          />
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={() => setStep('members')}>
              Back
            </Button>
            <Button fullWidth isLoading={isCreating} onClick={handleCreate}>
              Create group
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default NewGroupModal;

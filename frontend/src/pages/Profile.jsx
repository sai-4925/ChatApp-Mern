import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Camera } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';
import { updateProfileRequest, updateAvatarRequest } from '../services/userService';

const ProfilePage = () => {
  const { user, updateLocalUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user.name || '',
    username: user.username || '',
    bio: user.bio || '',
    status: user.status || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data } = await updateProfileRequest(form);
      updateLocalUser(data.user);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const { data } = await updateAvatarRequest(file);
      updateLocalUser(data.user);
      toast.success('Avatar updated');
    } catch (error) {
      toast.error('Could not update avatar');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark">
      <div className="mx-auto max-w-xl px-6 py-8">
        <button
          onClick={() => navigate('/chat')}
          className="mb-6 flex items-center gap-2 text-sm text-muted-light hover:text-ink-light dark:text-muted-dark dark:hover:text-ink-dark"
        >
          <ArrowLeft size={16} /> Back to chats
        </button>

        <h1 className="font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
          Your profile
        </h1>

        <div className="mt-6 flex flex-col items-center">
          <div className="relative">
            <Avatar src={user.avatar?.url} name={user.name} size="xl" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              aria-label="Change avatar"
              className="absolute bottom-0 right-0 rounded-full bg-primary-500 p-2 text-white hover:bg-primary-600 disabled:opacity-50"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-8 space-y-4">
          <Input label="Full name" name="name" value={form.name} onChange={handleChange} maxLength={50} />
          <Input label="Username" name="username" value={form.username} onChange={handleChange} maxLength={30} />
          <Input
            label="Status"
            name="status"
            placeholder="What's on your mind?"
            value={form.status}
            onChange={handleChange}
            maxLength={100}
          />
          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-ink-light dark:text-ink-dark">
              Bio
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              maxLength={150}
              rows={3}
              className="w-full rounded-xl border border-black/10 bg-surface-light px-4 py-2.5 text-sm text-ink-light focus:border-primary-500 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-ink-dark"
            />
            <p className="mt-1 text-right text-xs text-muted-light dark:text-muted-dark">
              {form.bio.length}/150
            </p>
          </div>

          <Button type="submit" fullWidth isLoading={isSaving}>
            Save changes
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

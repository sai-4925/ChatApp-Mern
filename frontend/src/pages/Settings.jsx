import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Sun, Moon, Monitor, LogOut } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import { THEMES } from '../constants';
import { updateSettingsRequest, changePasswordRequest } from '../services/userService';

const THEME_OPTIONS = [
  { value: THEMES.LIGHT, label: 'Light', icon: Sun },
  { value: THEMES.DARK, label: 'Dark', icon: Moon },
  { value: THEMES.SYSTEM, label: 'System', icon: Monitor },
];

const SectionCard = ({ title, children }) => (
  <div className="rounded-2xl border border-black/5 bg-surface-light p-5 dark:border-white/5 dark:bg-surface-dark">
    <h2 className="mb-4 font-display text-base font-semibold text-ink-light dark:text-ink-dark">
      {title}
    </h2>
    {children}
  </div>
);

const ToggleRow = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between py-2">
    <span className="text-sm text-ink-light dark:text-ink-dark">{label}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-5 w-9 appearance-none rounded-full bg-black/10 transition-colors checked:bg-primary-500 relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4 dark:bg-white/10"
    />
  </label>
);

const SettingsPage = () => {
  const { user, logout, updateLocalUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(
    user.settings?.notifications || { sound: true, browser: true }
  );
  const [privacy, setPrivacy] = useState(
    user.settings?.privacy || { lastSeen: 'everyone', readReceipts: true }
  );
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const persistSettings = async (updates) => {
    try {
      const { data } = await updateSettingsRequest(updates);
      updateLocalUser(data.user);
    } catch (error) {
      toast.error('Could not save settings');
    }
  };

  const handleNotificationToggle = (key, value) => {
    const next = { ...notifications, [key]: value };
    setNotifications(next);
    persistSettings({ notifications: next });
  };

  const handlePrivacyChange = (key, value) => {
    const next = { ...privacy, [key]: value };
    setPrivacy(next);
    persistSettings({ privacy: next });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePasswordRequest(passwordForm);
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark">
      <div className="mx-auto max-w-xl space-y-5 px-6 py-8">
        <button
          onClick={() => navigate('/chat')}
          className="flex items-center gap-2 text-sm text-muted-light hover:text-ink-light dark:text-muted-dark dark:hover:text-ink-dark"
        >
          <ArrowLeft size={16} /> Back to chats
        </button>

        <h1 className="font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
          Settings
        </h1>

        <SectionCard title="Appearance">
          <div className="flex gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-medium transition-colors ${
                  theme === value
                    ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-300'
                    : 'border-black/10 text-muted-light dark:border-white/10 dark:text-muted-dark'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Notifications">
          <ToggleRow
            label="Notification sound"
            checked={notifications.sound}
            onChange={(v) => handleNotificationToggle('sound', v)}
          />
          <ToggleRow
            label="Browser notifications"
            checked={notifications.browser}
            onChange={(v) => handleNotificationToggle('browser', v)}
          />
        </SectionCard>

        <SectionCard title="Privacy">
          <div className="py-2">
            <label className="mb-1.5 block text-sm text-ink-light dark:text-ink-dark">
              Who can see my last seen
            </label>
            <select
              value={privacy.lastSeen}
              onChange={(e) => handlePrivacyChange('lastSeen', e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-canvas-light px-3 py-2 text-sm dark:border-white/10 dark:bg-canvas-dark dark:text-ink-dark"
            >
              <option value="everyone">Everyone</option>
              <option value="contacts">My contacts</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>
          <ToggleRow
            label="Send read receipts"
            checked={privacy.readReceipts}
            onChange={(v) => handlePrivacyChange('readReceipts', v)}
          />
        </SectionCard>

        <SectionCard title="Account">
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <Input
              type="password"
              label="Current password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
            />
            <Input
              type="password"
              label="New password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
            />
            <Button type="submit" isLoading={isSavingPassword}>
              Change password
            </Button>
          </form>
        </SectionCard>

        <Button variant="danger" fullWidth onClick={handleLogout}>
          <LogOut size={16} /> Log out
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;

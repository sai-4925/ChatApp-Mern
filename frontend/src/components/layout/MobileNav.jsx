import { NavLink } from 'react-router-dom';
import { MessageCircle, User, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/chat', icon: MessageCircle, label: 'Chats' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const MobileNav = () => (
  <nav className="flex items-center justify-around border-t border-black/5 bg-surface-light py-2 dark:border-white/5 dark:bg-surface-dark lg:hidden">
    {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-4 py-1 text-xs ${
            isActive ? 'text-primary-500' : 'text-muted-light dark:text-muted-dark'
          }`
        }
      >
        <Icon size={20} />
        {label}
      </NavLink>
    ))}
  </nav>
);

export default MobileNav;

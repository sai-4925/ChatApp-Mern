const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-24 w-24 text-2xl',
};

const initialsFromName = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

/**
 * Avatar with an optional online presence dot. The dot uses a soft
 * "breathing" glow animation when online — the app's signature detail.
 */
const Avatar = ({ src, name, size = 'md', isOnline, showStatus = false, className = '' }) => {
  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${SIZE_CLASSES[size]} rounded-full object-cover ring-2 ring-white dark:ring-surface-dark`}
        />
      ) : (
        <div
          className={`${SIZE_CLASSES[size]} flex items-center justify-center rounded-full bg-primary-100 font-display font-semibold text-primary-700 ring-2 ring-white dark:bg-primary-800 dark:text-primary-100 dark:ring-surface-dark`}
        >
          {initialsFromName(name) || '?'}
        </div>
      )}
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white dark:ring-surface-dark ${
            isOnline ? 'bg-mint-500 animate-pulse-glow' : 'bg-muted-light dark:bg-muted-dark'
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;

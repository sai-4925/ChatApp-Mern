const VARIANT_CLASSES = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-300 shadow-sm shadow-primary-500/20',
  secondary:
    'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/40 dark:text-primary-200 dark:hover:bg-primary-900/70',
  ghost:
    'bg-transparent text-ink-light hover:bg-black/5 dark:text-ink-dark dark:hover:bg-white/5',
  danger: 'bg-accent-500 text-white hover:bg-accent-600 disabled:bg-accent-300',
};

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-150 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
};

export default Button;

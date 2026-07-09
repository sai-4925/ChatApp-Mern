import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, id, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-light dark:text-ink-dark">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`w-full rounded-xl border bg-surface-light px-4 py-2.5 text-sm text-ink-light placeholder:text-muted-light focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:bg-surface-dark dark:text-ink-dark dark:placeholder:text-muted-dark ${
          error ? 'border-accent-500' : 'border-black/10 dark:border-white/10'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-accent-600 dark:text-accent-400">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

import { Link } from 'react-router-dom';

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="flex min-h-screen bg-canvas-light dark:bg-canvas-dark">
      {/* Left: form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-[46%] lg:px-20">
        <Link to="/" className="mb-10 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 font-display text-lg font-bold text-white">
            C
          </div>
          <span className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
            ChatApp
          </span>
        </Link>

        <h1 className="font-display text-2xl font-semibold text-ink-light dark:text-ink-dark sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-muted-light dark:text-muted-dark">{subtitle}</p>
        )}

        <div className="mt-8 max-w-sm">{children}</div>
      </div>

      {/* Right: ambient brand panel */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-primary-500 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(46,216,167,0.25),transparent_45%)]" />
        <div className="relative z-10 max-w-md px-10 text-center">
          <p className="font-display text-3xl font-semibold leading-snug text-white">
            Conversations that feel instant.
          </p>
          <p className="mt-4 text-sm text-primary-100">
            Real-time messaging, read receipts, and media sharing — built for how people actually talk.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

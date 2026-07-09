import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const FEATURES = [
  {
    title: 'Real-time, always',
    desc: 'Messages, typing indicators, and read receipts sync instantly over WebSockets.',
  },
  {
    title: 'Rich media sharing',
    desc: 'Send images, videos, voice notes, and documents with previews before you send.',
  },
  {
    title: 'Group conversations',
    desc: 'Create groups, manage admins, and keep everyone in sync in one thread.',
  },
  {
    title: 'Built for control',
    desc: 'Pin, archive, mute, star, and search — organize chats the way you actually think.',
  },
];

const MockChatWindow = () => (
  <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface-dark/60 p-4 shadow-2xl shadow-primary-900/30 backdrop-blur">
    <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3">
      <div className="h-8 w-8 rounded-full bg-primary-400" />
      <div>
        <p className="text-sm font-medium text-white">Priya Sharma</p>
        <p className="flex items-center gap-1 text-xs text-mint-400">
          <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-mint-500" /> Online
        </p>
      </div>
    </div>
    <div className="space-y-2">
      <div className="ml-auto w-fit max-w-[75%] rounded-bubble-sent bg-primary-500 px-3 py-2 text-sm text-white">
        Are we still on for the 3pm sync?
      </div>
      <div className="w-fit max-w-[75%] rounded-bubble-received bg-white/10 px-3 py-2 text-sm text-white">
        Yep! Sending the deck over now
      </div>
      <div className="flex w-fit items-center gap-1 rounded-bubble-received bg-white/10 px-3 py-2">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" />
      </div>
    </div>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 font-display text-lg font-bold text-white">
            C
          </div>
          <span className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
            ChatApp
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-ink-light hover:text-primary-600 dark:text-ink-dark">
            Log in
          </Link>
          <Link to="/register">
            <Button size="sm">Sign up free</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary-600 dark:text-primary-300">
            Real-time . Secure . Open source
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink-light dark:text-ink-dark sm:text-5xl">
            Conversations that feel instant.
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-light dark:text-muted-dark">
            A modern messaging app with one-to-one and group chat, media sharing, and read
            receipts — built end-to-end on the MERN stack.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/register">
              <Button size="lg">Get started</Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="secondary">
                See features
              </Button>
            </a>
          </div>
        </div>

        <div className="flex justify-center rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-10">
          <MockChatWindow />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
          Everything a modern chat app needs
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-black/5 bg-surface-light p-6 dark:border-white/5 dark:bg-surface-dark"
            >
              <h3 className="font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-muted-light dark:text-muted-dark">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-black/5 py-8 text-center text-sm text-muted-light dark:border-white/5 dark:text-muted-dark">
        Built with the MERN stack. (c) {new Date().getFullYear()} ChatApp.
      </footer>
    </div>
  );
};

export default LandingPage;

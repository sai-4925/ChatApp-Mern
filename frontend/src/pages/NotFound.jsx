import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-canvas-light px-6 text-center dark:bg-canvas-dark">
    <p className="font-mono text-sm text-muted-light dark:text-muted-dark">Error 404</p>
    <h1 className="mt-2 font-display text-6xl font-bold text-primary-500">···</h1>
    <p className="mt-4 max-w-sm text-ink-light dark:text-ink-dark">
      This conversation doesn't exist. The page you're looking for may have been moved or deleted.
    </p>
    <Link
      to="/"
      className="mt-6 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
    >
      Back to home
    </Link>
  </div>
);

export default NotFoundPage;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { forgotPasswordRequest } from '../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await forgotPasswordRequest(email);
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
    >
      {submitted ? (
        <div className="rounded-xl border border-mint-500/30 bg-mint-500/10 p-4 text-sm text-ink-light dark:text-ink-dark">
          If an account exists for <strong>{email}</strong>, a password reset link is on its way.
          Check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Button type="submit" fullWidth isLoading={isLoading}>
            Send reset link
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-muted-light dark:text-muted-dark">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-300">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { resetPasswordRequest } from '../services/authService';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8 || !/\d/.test(password)) {
      setError('At least 8 characters, including a number');
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordRequest(token, password);
      toast.success('Password reset. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid link" subtitle="This password reset link is missing its token.">
        <Link to="/forgot-password" className="text-sm font-medium text-primary-600 dark:text-primary-300">
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Make it something you haven't used before.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          id="password"
          type="password"
          label="New password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          autoComplete="new-password"
        />
        <Button type="submit" fullWidth isLoading={isLoading}>
          Reset password
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;

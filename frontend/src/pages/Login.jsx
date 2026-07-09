import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!form.email || !form.password) {
      setErrors({
        email: !form.email ? 'Email is required' : undefined,
        password: !form.password ? 'Password is required' : undefined,
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(form);
      const redirectTo = location.state?.from?.pathname || '/chat';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue your conversations.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-light dark:text-muted-dark">
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
              className="rounded border-black/20 text-primary-500 focus:ring-primary-500"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-300">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth isLoading={isLoading}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-light dark:text-muted-dark">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-300">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;

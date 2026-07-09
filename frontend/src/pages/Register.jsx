import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!/^[a-z0-9_.]{3,30}$/i.test(form.username)) {
      next.username = 'Username must be 3-30 characters (letters, numbers, . or _)';
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    if (form.password.length < 8 || !/\d/.test(form.password)) {
      next.password = 'At least 8 characters, including a number';
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start messaging in under a minute.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          id="name"
          name="name"
          label="Full name"
          placeholder="Jane Doe"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Input
          id="username"
          name="username"
          label="Username"
          placeholder="janedoe"
          value={form.username}
          onChange={handleChange}
          error={errors.username}
          autoComplete="username"
        />
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
          placeholder="At least 8 characters"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
        />

        <Button type="submit" fullWidth isLoading={isLoading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-light dark:text-muted-dark">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-300">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;

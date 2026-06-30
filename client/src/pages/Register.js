import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';
import AuthShell from '../components/AuthShell';
import { Input } from '../components/Input';
import Button from '../components/Button';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Mirrors the server's express-validator rules so users get instant feedback.
  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.username.trim()) next.username = 'Username is required';
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username))
      next.username = '3–20 characters: letters, numbers, underscores';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    if (!form.password) next.password = 'Password is required';
    else if (form.password.length < 6) next.password = 'At least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(form);
      toast.success('Welcome to Plume');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create your account'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Pick a handle and start posting in seconds."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Name"
          name="name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          value={form.name}
          onChange={update}
          error={errors.name}
        />
        <Input
          label="Username"
          name="username"
          autoComplete="username"
          placeholder="ada"
          value={form.username}
          onChange={update}
          error={errors.username}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={update}
          error={errors.email}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={update}
          error={errors.password}
        />
        <Button type="submit" fullWidth loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
};

export default Register;

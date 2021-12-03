import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';
import AuthShell from '../components/AuthShell';
import { Input } from '../components/Input';
import Button from '../components/Button';

const DEMO = { email: 'ada@plume.app', password: 'password123' };

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={from} replace />;

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (credentials) => {
    setSubmitting(true);
    try {
      await login(credentials);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Could not sign you in'));
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (validate()) submit(form);
  };

  const onDemo = () => {
    setForm(DEMO);
    setErrors({});
    submit(DEMO);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where the feed left off."
      footer={
        <>
          New to Plume?{' '}
          <Link to="/register" className="font-medium text-indigo hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          onChange={update}
          error={errors.password}
        />
        <Button type="submit" fullWidth loading={submitting}>
          Sign in
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <Button variant="secondary" fullWidth onClick={onDemo} disabled={submitting}>
        Explore with a demo account
      </Button>
      <p className="mt-2 text-center text-xs text-muted">
        Signs you in as @ada — no sign-up needed.
      </p>
    </AuthShell>
  );
};

export default Login;

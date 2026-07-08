import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Button, Card, Input } from '../components/index.jsx';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password
      });
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3 inline-block">💸</div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">SplitMint</h1>
            <p className="text-gray-400">Create account to get started</p>
          </div>

          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-xl p-3 mb-6">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              disabled={loading}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              disabled={loading}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              disabled={loading}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full mb-6"
            >
              {loading ? '🔄 Creating account...' : '✨ Sign Up'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to='/login' className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                Login here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>💸 SplitMint</h1>
        <h2 style={styles.title}>Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} placeholder="Email"
          value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input style={styles.input} type="password" placeholder="Password"
          value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        <button style={styles.btn} onClick={handleSubmit}>Login</button>
        <p style={styles.link}>
          <Link to="/forgot-password" style={styles.linkText}>Forgot password?</Link>
        </p>
        <p style={styles.link}>No account? <Link to="/signup" style={styles.linkText}>Sign up</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f' },
  card: { background: '#1a1a1a', padding: '40px', borderRadius: '12px', width: '360px', display: 'flex', flexDirection: 'column', gap: '12px' },
  logo: { color: '#4ade80', textAlign: 'center', margin: 0 },
  title: { color: '#fff', textAlign: 'center', margin: 0 },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff', fontSize: '14px' },
  btn: { padding: '12px', borderRadius: '8px', background: '#4ade80', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '16px' },
  error: { color: '#f87171', textAlign: 'center', margin: 0 },
  link: { color: '#aaa', textAlign: 'center', margin: 0, fontSize: '14px' },
  linkText: { color: '#4ade80', textDecoration: 'none' },
};
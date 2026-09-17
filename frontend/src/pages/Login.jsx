import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal.');
    } finally {
      setBusy(false);
    }
  };

  const quick = (email, password) => setForm({ email, password });

  return (
    <div className="container page narrow">
      <h1>Masuk</h1>
      {error && <div className="alert error">{error}</div>}

      <form className="form" onSubmit={submit}>
        <label>Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <label>Password</label>
        <input
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="btn btn-primary full" disabled={busy}>
          {busy ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <div className="alert small">
        <strong>Akun demo:</strong>
        <div className="row-between">
          <span>admin@shop.test / admin123</span>
          <button className="btn btn-ghost" onClick={() => quick('admin@shop.test', 'admin123')}>
            Isi admin
          </button>
        </div>
        <div className="row-between">
          <span>user@shop.test / user123</span>
          <button className="btn btn-ghost" onClick={() => quick('user@shop.test', 'user123')}>
            Isi user
          </button>
        </div>
      </div>

      <p className="muted small">
        Belum punya akun? <Link to="/register">Daftar di sini</Link>
      </p>
    </div>
  );
}

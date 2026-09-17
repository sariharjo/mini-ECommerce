import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page narrow">
      <h1>Daftar Akun</h1>
      {error && <div className="alert error">{error}</div>}

      <form className="form" onSubmit={submit}>
        <label>Nama lengkap</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <label>Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <label>Password (min. 6 karakter)</label>
        <input
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="btn btn-primary full" disabled={busy}>
          {busy ? 'Memproses...' : 'Daftar'}
        </button>
      </form>

      <p className="muted small">
        Sudah punya akun? <Link to="/login">Masuk</Link>
      </p>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { rupiah } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { items, setQty, remove, clear, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const checkout = async () => {
    if (!user) return navigate('/login');
    setBusy(true);
    setError('');
    try {
      const payload = items.map((i) => ({ product_id: i.id, qty: i.qty }));
      const { data } = await api.post('/orders', { items: payload, address });
      clear();
      setMsg(`Pesanan #${data.id} berhasil dibuat. Total ${rupiah(data.total)}.`);
      setTimeout(() => navigate('/orders'), 1200);
    } catch (e) {
      setError(e.response?.data?.message || 'Checkout gagal.');
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container page">
        <h1>Keranjang</h1>
        {msg && <div className="alert success">{msg}</div>}
        <div className="alert">
          Keranjang masih kosong. <Link to="/">Mulai belanja →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <h1>Keranjang</h1>
      {msg && <div className="alert success">{msg}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="cart-layout">
        <div className="cart-list">
          {items.map((i) => (
            <div key={i.id} className="cart-item">
              <img src={i.image_url || 'https://picsum.photos/seed/placeholder/200/200'} alt={i.name} />
              <div className="grow">
                <Link to={`/product/${i.id}`} className="product-name">
                  {i.name}
                </Link>
                <div className="muted small">{rupiah(i.price)}</div>
              </div>
              <input
                className="qty-input"
                type="number"
                min="1"
                value={i.qty}
                onChange={(e) => setQty(i.id, Number(e.target.value) || 1)}
              />
              <strong>{rupiah(i.price * i.qty)}</strong>
              <button className="btn btn-ghost danger" onClick={() => remove(i.id)}>
                Hapus
              </button>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h3>Ringkasan</h3>
          <div className="row-between">
            <span>Subtotal</span>
            <strong>{rupiah(total)}</strong>
          </div>
          <div className="row-between">
            <span>Pengiriman</span>
            <span>Gratis</span>
          </div>
          <hr />
          <div className="row-between">
            <span>Total</span>
            <strong className="price">{rupiah(total)}</strong>
          </div>

          <label className="small muted">Alamat pengiriman</label>
          <textarea
            rows="3"
            placeholder="Nama, telepon, alamat lengkap..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <button className="btn btn-primary full" disabled={busy} onClick={checkout}>
            {busy ? 'Memproses...' : user ? 'Checkout' : 'Login untuk Checkout'}
          </button>
        </aside>
      </div>
    </div>
  );
}

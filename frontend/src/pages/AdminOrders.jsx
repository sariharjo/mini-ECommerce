import { useEffect, useState } from 'react';
import api, { rupiah } from '../api';

const STATUSES = ['pending', 'paid', 'shipped', 'done', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/orders/admin/all').then((r) => setOrders(r.data));

  useEffect(() => {
    load().catch((e) => setError(e.response?.data?.message || 'Gagal memuat pesanan.'));
  }, []);

  const changeStatus = async (id, status) => {
    setMsg('');
    setError('');
    try {
      await api.put(`/orders/admin/${id}/status`, { status });
      setMsg(`Status order #${id} diubah menjadi ${status}.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah status.');
    }
  };

  return (
    <div className="container page">
      <h1>Kelola Pesanan</h1>
      {msg && <div className="alert success">{msg}</div>}
      {error && <div className="alert error">{error}</div>}

      {orders.length === 0 ? (
        <div className="alert">Belum ada pesanan masuk.</div>
      ) : (
        orders.map((o) => (
          <div key={o.id} className="order-card">
            <div className="row-between">
              <div>
                <strong>Order #{o.id}</strong>
                <div className="muted small">
                  {o.user_name} ({o.user_email}) • {new Date(o.created_at).toLocaleString('id-ID')}
                </div>
              </div>
              <select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Harga</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {o.items.map((it, idx) => (
                  <tr key={idx}>
                    <td>{it.name}</td>
                    <td>{rupiah(it.price)}</td>
                    <td>{it.qty}</td>
                    <td>{rupiah(it.price * it.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="row-between">
              <span className="muted small">Alamat: {o.address || '-'}</span>
              <strong className="price">Total {rupiah(o.total)}</strong>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

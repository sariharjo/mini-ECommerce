import { useEffect, useState } from 'react';
import api, { rupiah } from '../api';

const statusColor = {
  pending: 'warn',
  paid: 'info',
  shipped: 'info',
  done: 'ok',
  cancelled: 'bad',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/orders').then((r) => setOrders(r.data));

  useEffect(() => {
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const act = async (id, action) => {
    setMsg('');
    setError('');
    setBusyId(id);
    try {
      const { data } = await api.post(`/orders/${id}/${action}`);
      setMsg(`Order #${id}: ${data.message}`);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal memproses pesanan.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="container page"><p className="muted">Memuat pesanan...</p></div>;

  return (
    <div className="container page">
      <h1>Pesanan Saya</h1>
      {msg && <div className="alert success">{msg}</div>}
      {error && <div className="alert error">{error}</div>}
      {orders.length === 0 ? (
        <div className="alert">Belum ada pesanan.</div>
      ) : (
        orders.map((o) => (
          <div key={o.id} className="order-card">
            <div className="row-between">
              <div>
                <strong>Order #{o.id}</strong>
                <div className="muted small">{new Date(o.created_at).toLocaleString('id-ID')}</div>
              </div>
              <span className={`status ${statusColor[o.status] || ''}`}>{o.status}</span>
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

            {o.status === 'pending' && (
              <div className="row-gap order-actions">
                <button
                  className="btn btn-primary"
                  disabled={busyId === o.id}
                  onClick={() => act(o.id, 'pay')}
                >
                  {busyId === o.id ? 'Memproses...' : '💳 Bayar Sekarang'}
                </button>
                <button
                  className="btn btn-ghost danger"
                  disabled={busyId === o.id}
                  onClick={() => act(o.id, 'cancel')}
                >
                  Batalkan
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import api, { rupiah } from '../api';

const empty = { name: '', description: '', price: '', stock: '', category: 'Umum', image_url: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = () =>
    api.get('/products', { params: { limit: 50 } }).then((r) => setProducts(r.data.items));

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
    };
    try {
      if (editingId) await api.put(`/products/${editingId}`, payload);
      else await api.post('/products', payload);
      setMsg(editingId ? 'Produk diperbarui.' : 'Produk ditambahkan.');
      reset();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan produk.');
    }
  };

  const edit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock: p.stock,
      category: p.category,
      image_url: p.image_url || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = async (p) => {
    if (!confirm(`Hapus produk "${p.name}"?`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      setMsg('Produk dihapus.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus produk.');
    }
  };

  return (
    <div className="container page">
      <h1>Kelola Produk</h1>
      {msg && <div className="alert success">{msg}</div>}
      {error && <div className="alert error">{error}</div>}

      <form className="form card form-card" onSubmit={submit}>
        <h3>{editingId ? `Edit Produk #${editingId}` : 'Tambah Produk Baru'}</h3>
        <div className="form-grid">
          <div>
            <label>Nama</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label>Kategori</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div>
            <label>Harga</label>
            <input
              type="number"
              min="0"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label>Stok</label>
            <input
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div className="span-2">
            <label>URL Gambar</label>
            <input
              value={form.image_url}
              placeholder="https://..."
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </div>
          <div className="span-2">
            <label>Deskripsi</label>
            <textarea
              rows="2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        <div className="row-gap">
          <button className="btn btn-primary" type="submit">
            {editingId ? 'Simpan Perubahan' : 'Tambah Produk'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={reset}>
              Batal
            </button>
          )}
        </div>
      </form>

      <table className="table card">
        <thead>
          <tr>
            <th>#</th>
            <th>Nama</th>
            <th>Kategori</th>
            <th>Harga</th>
            <th>Stok</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{rupiah(p.price)}</td>
              <td>{p.stock}</td>
              <td className="row-gap">
                <button className="btn btn-ghost" onClick={() => edit(p)}>
                  Edit
                </button>
                <button className="btn btn-ghost danger" onClick={() => del(p)}>
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

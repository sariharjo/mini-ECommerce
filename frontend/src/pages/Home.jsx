import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(params.get('search') || '');
  const [loading, setLoading] = useState(true);

  const page = Number(params.get('page') || 1);
  const category = params.get('category') || '';

  useEffect(() => {
    api.get('/products/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/products', { params: { page, limit: 8, category, search: params.get('search') || '' } })
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, category, params]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    update({ search, page: '' });
  };

  return (
    <div className="container page">
      <section className="hero">
        <h1>Belanja Mudah, Harga Bersahabat</h1>
        <p>Temukan produk favoritmu — {data.total} produk tersedia.</p>
        <form onSubmit={submitSearch} className="search">
          <input
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Cari
          </button>
        </form>
      </section>

      <div className="filters">
        <button className={`pill ${!category ? 'active' : ''}`} onClick={() => update({ category: '', page: '' })}>
          Semua
        </button>
        {categories.map((c) => (
          <button
            key={c.category}
            className={`pill ${category === c.category ? 'active' : ''}`}
            onClick={() => update({ category: c.category, page: '' })}
          >
            {c.category} ({c.total})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted">Memuat produk...</p>
      ) : data.items.length === 0 ? (
        <div className="alert">Produk tidak ditemukan.</div>
      ) : (
        <div className="grid">
          {data.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`pill ${n === page ? 'active' : ''}`}
              onClick={() => update({ page: String(n) })}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

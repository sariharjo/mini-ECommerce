import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { rupiah } from '../api';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((r) => setProduct(r.data))
      .catch((e) => setError(e.response?.data?.message || 'Produk tidak ditemukan.'));
  }, [id]);

  if (error) return <div className="container page"><div className="alert error">{error}</div></div>;
  if (!product) return <div className="container page"><p className="muted">Memuat...</p></div>;

  return (
    <div className="container page">
      <Link to="/" className="muted small">
        ← Kembali ke daftar produk
      </Link>

      <div className="detail">
        <img
          className="detail-img"
          src={product.image_url || 'https://picsum.photos/seed/placeholder/600/600'}
          alt={product.name}
        />

        <div className="detail-info">
          <span className="chip inline">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="muted">{product.description || 'Tanpa deskripsi.'}</p>
          <div className="price big">{rupiah(product.price)}</div>
          <p className="small muted">Stok tersedia: {product.stock}</p>

          <div className="qty-row">
            <button className="btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              −
            </button>
            <input value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
            <button className="btn" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>
              +
            </button>
          </div>

          <button
            className="btn btn-primary full"
            disabled={product.stock <= 0}
            onClick={() => add(product, qty)}
          >
            {product.stock <= 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
          </button>
        </div>
      </div>
    </div>
  );
}

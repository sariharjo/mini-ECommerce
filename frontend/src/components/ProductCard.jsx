import { Link } from 'react-router-dom';
import { rupiah } from '../api';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { add } = useCart();
  const out = product.stock <= 0;

  return (
    <div className="card product-card">
      <Link to={`/product/${product.id}`} className="thumb">
        <img src={product.image_url || 'https://picsum.photos/seed/placeholder/600/600'} alt={product.name} />
        <span className="chip">{product.category}</span>
      </Link>

      <div className="card-body">
        <Link to={`/product/${product.id}`} className="product-name">
          {product.name}
        </Link>
        <p className="muted small clamp-2">{product.description || 'Tanpa deskripsi.'}</p>

        <div className="row-between">
          <strong className="price">{rupiah(product.price)}</strong>
          <span className={`stock ${out ? 'out' : ''}`}>Stok {product.stock}</span>
        </div>

        <button className="btn btn-primary full" disabled={out} onClick={() => add(product, 1)}>
          {out ? 'Stok Habis' : '+ Keranjang'}
        </button>
      </div>
    </div>
  );
}

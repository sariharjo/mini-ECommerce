import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          🛒 Mini<span>Shop</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>
            Produk
          </NavLink>
          {user && <NavLink to="/orders">Pesanan Saya</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin/products">Kelola Produk</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin/orders">Kelola Pesanan</NavLink>}
        </nav>

        <div className="nav-actions">
          <Link to="/cart" className="cart-btn">
            🛍️ <span className="badge">{count}</span>
          </Link>

          {user ? (
            <>
              <span className="user-chip">
                {user.name} {user.role === 'admin' && <em>admin</em>}
              </span>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Masuk
              </Link>
              <Link to="/register" className="btn btn-primary">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

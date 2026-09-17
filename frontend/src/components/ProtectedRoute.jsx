import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, admin = false }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') {
    return (
      <div className="container page">
        <div className="alert error">Halaman ini hanya untuk admin.</div>
      </div>
    );
  }
  return children;
}

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Si no tiene el rol necesario, enviarlo al panel general que le corresponda
    return <Navigate to="/dashboard/user" replace />;
  }

  return <Outlet />;
};

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import { getDashboardPathByRole } from '../../shared/utils/roles';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Si no tiene el rol necesario, enviarlo al panel general que le corresponda
    return <Navigate to={getDashboardPathByRole(role)} replace />;
  }

  return <Outlet />;
};

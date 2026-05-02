import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginForm } from '../../features/auth/components/LoginForm';
import Dashboard from '../../features/dashboard/components/Dashboard';
import { useAuthStore } from '../../features/auth/store/authStore';

// Import migrated components
import Register from '../../features/auth/components/Register';
import VerifyEmail from '../../features/auth/components/VerifyEmail';
import Accounts from '../../features/accounts/components/Accounts';
import Transactions from '../../features/transactions/components/Transactions';
import Cards from '../../features/cards/components/Cards';
import Loans from '../../features/loans/components/Loans';
import Profile from '../../features/profile/components/Profile';
import Statements from '../../features/statements/components/Statements';
import { getDashboardPathByRole, isAdministrativeRole } from '../../shared/utils/roles';

export const AppRouter = () => {
  const { isAuthenticated, role } = useAuthStore();

  const getDashboardPath = () => getDashboardPathByRole(role);
  const isAdmin = isAdministrativeRole(role);

  return (
    <Routes>
      {/* Rutas con AuthLayout (Login, Register, Verify) */}
      <Route element={<AuthLayout />}>
        <Route 
          path="/" 
          element={<LoginForm />} 
        />
        <Route 
          path="login" 
          element={<LoginForm />} 
        />
        <Route 
          path="register" 
          element={isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <Register />} 
        />
        <Route path="verify-email" element={<VerifyEmail />} />
      </Route>

      {/* Rutas Privadas */}
      <Route path="/dashboard" element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          
          <Route path="admin" element={isAdmin ? <Dashboard /> : <Navigate to="/dashboard/user" replace />} />
          <Route path="user" element={<Dashboard />} />

          <Route index element={<Navigate to={getDashboardPath()} replace />} />
          
          <Route path="accounts" element={isAdmin ? <Accounts /> : <Navigate to="/dashboard/user" replace />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="cards" element={<Cards />} />
          <Route path="loans" element={<Loans />} />
          <Route path="profile" element={<Profile />} />
          <Route path="statements" element={<Statements />} />
        </Route>
      </Route>

      <Route path="/accounts" element={<Navigate to={isAdmin ? '/dashboard/accounts' : '/dashboard/user'} replace />} />
      <Route path="/transactions" element={<Navigate to="/dashboard/transactions" replace />} />
      <Route path="/cards" element={<Navigate to="/dashboard/cards" replace />} />
      <Route path="/loans" element={<Navigate to="/dashboard/loans" replace />} />
      <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
      <Route path="/statements" element={<Navigate to="/dashboard/statements" replace />} />

      {/* Ruta 404 Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

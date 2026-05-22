import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginForm } from '../../features/auth/components/LoginForm';
import ForgotPassword from '../../features/auth/components/ForgotPassword';
import ResetPassword from '../../features/auth/components/ResetPassword';
import Dashboard from '../../features/dashboard/components/Dashboard';
import { useAuthStore } from '../../features/auth/store/authStore';

import VerifyEmail from '../../features/auth/components/VerifyEmail';
import Accounts from '../../features/accounts/components/Accounts';
import Transactions from '../../features/transactions/components/Transactions';
import Cards from '../../features/cards/components/Cards';
import Loans from '../../features/loans/components/Loans';
import Profile from '../../features/profile/components/Profile';
import Statements from '../../features/statements/components/Statements';
import Products from '../../features/products/components/Products';
import { getDashboardPathByRole, isAdministrativeRole } from '../../shared/utils/roles';

export const AppRouter = () => {
  const { role } = useAuthStore();

  const getDashboardPath = () => getDashboardPathByRole(role);
  const isAdmin = isAdministrativeRole(role);

  return (
    <Routes>
      {/* Rutas con AuthLayout (Login y verificacion) */}
      <Route element={<AuthLayout />}>
        <Route 
          path="/" 
          element={<LoginForm />} 
        />
        <Route 
          path="login" 
          element={<LoginForm />} 
        />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route 
          path="register" 
          element={<Navigate to="/login" replace />} 
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
          <Route path="products" element={<Products />} />
          <Route path="admin-tools" element={<Navigate to={isAdmin ? '/dashboard/admin' : '/dashboard/user'} replace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="statements" element={<Statements />} />
        </Route>
      </Route>

      <Route path="/accounts" element={<Navigate to={isAdmin ? '/dashboard/accounts' : '/dashboard/user'} replace />} />
      <Route path="/transactions" element={<Navigate to="/dashboard/transactions" replace />} />
      <Route path="/cards" element={<Navigate to="/dashboard/cards" replace />} />
      <Route path="/loans" element={<Navigate to="/dashboard/loans" replace />} />
      <Route path="/products" element={<Navigate to="/dashboard/products" replace />} />
      <Route path="/admin-tools" element={<Navigate to={isAdmin ? '/dashboard/admin' : '/dashboard/user'} replace />} />
      <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
      <Route path="/statements" element={<Navigate to="/dashboard/statements" replace />} />

      {/* Ruta 404 Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

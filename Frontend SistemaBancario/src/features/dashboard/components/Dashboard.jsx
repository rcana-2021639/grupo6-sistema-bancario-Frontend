import { useAuthStore } from '../../../features/auth/store/authStore';
import { isAdministrativeRole } from '../../../shared/utils/roles';
import AdminDashboard from './AdminDashboard';
import ClientDashboard from './ClientDashboard';

const Dashboard = () => {
  const { user, role } = useAuthStore();
  const userName = user?.name || user?.Name || user?.username || user?.Username || 'Usuario';

  if (isAdministrativeRole(role)) {
    return <AdminDashboard userName={userName} />;
  }

  return <ClientDashboard user={user} userName={userName} />;
};

export default Dashboard;

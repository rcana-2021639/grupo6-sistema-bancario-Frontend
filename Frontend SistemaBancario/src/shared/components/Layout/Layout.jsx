import { useState } from 'react';
import Aurora from '../Aurora/Aurora';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { isAdministrativeRole } from '../../utils/roles';
import Header from './Header';
import Sidebar from './Sidebar';
import '../../../styles/lumina-dashboard.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, role } = useAuthStore();
  const isAdmin = isAdministrativeRole(role || user?.role);

  return (
    <div className={`lumina-dashboard-shell ${isAdmin ? 'is-admin-shell' : 'is-client-shell'}`}>
      <div className="lumina-dashboard-bg" aria-hidden="true">
        <Aurora
          colorStops={isAdmin ? ['#f6d77b', '#7c3aed', '#2dd4bf'] : ['#f7cf5f', '#a855f7', '#5ee4a8']}
          blend={isAdmin ? 0.2 : 0.3}
          amplitude={isAdmin ? 0.72 : 1}
          speed={isAdmin ? 0.62 : 0.9}
        />
      </div>

      <Header />
      <div className="lumina-dashboard-body">
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen((value) => !value)} />
        <main className="lumina-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

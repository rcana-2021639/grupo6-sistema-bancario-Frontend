import { useState } from 'react';
import Aurora from '../Aurora/Aurora';
import Header from './Header';
import Sidebar from './Sidebar';
import '../../../styles/lumina-dashboard.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="lumina-dashboard-shell">
      <div className="lumina-dashboard-bg" aria-hidden="true">
        <Aurora
          colorStops={['#b67aee', '#ee7fb6', '#f0cd61']}
          blend={0.28}
          amplitude={1}
          speed={1}
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

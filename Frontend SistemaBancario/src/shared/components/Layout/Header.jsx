import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Gem, LogOut, Menu, ShieldCheck, UserRound, X } from 'lucide-react';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { isAdministrativeRole } from '../../utils/roles';

const userNavItems = [
  { to: '/dashboard', label: 'Private Desk', end: true },
  { to: '/dashboard/transactions', label: 'Transfers' },
  { to: '/dashboard/cards', label: 'Cards' },
  { to: '/dashboard/loans', label: 'Credit' },
  { to: '/dashboard/statements', label: 'Statements' },
  { to: '/dashboard/profile', label: 'Profile' },
];

const adminNavItems = [
  { to: '/dashboard', label: 'Command', end: true },
  { to: '/dashboard/accounts', label: 'Accounts' },
  { to: '/dashboard/transactions', label: 'Operations' },
  { to: '/dashboard/cards', label: 'Cards' },
  { to: '/dashboard/loans', label: 'Loans' },
  { to: '/dashboard/profile', label: 'Profile' },
];

const Header = () => {
  const { user, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const isAdmin = isAdministrativeRole(role || user?.role);
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const userName = user?.name || user?.Name || user?.username || user?.Username || 'Usuario';
  const userEmail = user?.email || user?.Email || '';
  const initial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsUserOpen(false);
    navigate('/login', { replace: true });
  };

  const linkClass = ({ isActive }) => (
    `lumina-header-link ${isActive ? 'is-active' : ''}`
  );

  return (
    <header className="lumina-header">
      <div className="lumina-header-inner">
        <Link to="/dashboard" className="lumina-brand-link">
          <span className="lumina-brand-mark"><Gem size={20} /></span>
          <span>
            <strong>Lumina Bank</strong>
            <small>{isAdmin ? 'Administrative Command' : 'Private Banking'}</small>
          </span>
        </Link>

        <nav className="lumina-header-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="lumina-header-actions">
          <button type="button" className="lumina-icon-btn" aria-label="Notificaciones">
            <Bell size={18} />
          </button>

          {user ? (
            <div className="lumina-user-menu">
              <button
                type="button"
                className="lumina-user-trigger"
                onClick={() => setIsUserOpen((value) => !value)}
              >
                <span className="lumina-avatar">{initial}</span>
                <span className="lumina-user-copy">
                  <strong>{userName}</strong>
                  {userEmail && <small>{userEmail}</small>}
                </span>
                <ChevronDown size={16} />
              </button>

              {isUserOpen && (
                <div className="lumina-user-dropdown">
                  <Link to="/dashboard/profile" onClick={() => setIsUserOpen(false)}>
                    <UserRound size={16} /> Perfil privado
                  </Link>
                  <button type="button" onClick={handleLogout}>
                    <LogOut size={16} /> Cerrar sesion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="lumina-button">
              Iniciar sesion
            </Link>
          )}

          <button
            type="button"
            className="lumina-mobile-toggle"
            onClick={() => setIsMenuOpen((value) => !value)}
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lumina-mobile-menu">
          <div className="lumina-badge"><ShieldCheck size={14} /> {isAdmin ? 'Admin mode' : 'Private client'}</div>
          <nav>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={linkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          {user && (
            <button type="button" className="lumina-button secondary" onClick={handleLogout}>
              <LogOut size={16} /> Cerrar sesion
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;

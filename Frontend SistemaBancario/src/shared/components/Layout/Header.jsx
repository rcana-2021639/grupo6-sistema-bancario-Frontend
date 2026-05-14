import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, Gem, LogOut, Menu, ShieldCheck, UserRound, X } from 'lucide-react';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { isAdministrativeRole } from '../../utils/roles';

const userNavItems = [
  { to: '/dashboard', label: 'Inicio privado', end: true },
  { to: '/dashboard/transactions', label: 'Transferencias' },
  { to: '/dashboard/cards', label: 'Tarjetas' },
  { to: '/dashboard/loans', label: 'Creditos' },
  { to: '/dashboard/statements', label: 'Estados' },
];

const adminNavItems = [
  { to: '/dashboard', label: 'Centro', end: true },
  { to: '/dashboard/accounts', label: 'Cuentas' },
  { to: '/dashboard/transactions', label: 'Operaciones' },
  { to: '/dashboard/cards', label: 'Tarjetas' },
  { to: '/dashboard/loans', label: 'Prestamos' },
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
  const userRoleLabel = isAdmin ? 'Equipo administrativo' : 'Cliente privado';
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
            <small>{isAdmin ? 'Comando administrativo' : 'Banca privada'}</small>
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
          {user ? (
            <div className="lumina-user-menu">
              <button
                type="button"
                className={`lumina-user-trigger ${isUserOpen ? 'is-open' : ''}`}
                onClick={() => setIsUserOpen((value) => !value)}
                aria-expanded={isUserOpen}
              >
                <span className="lumina-avatar">{initial}</span>
                <span className="lumina-user-copy">
                  <strong>{userName}</strong>
                  <small>{userEmail || userRoleLabel}</small>
                </span>
                <ChevronDown className="lumina-user-chevron" size={16} />
              </button>

              {isUserOpen && (
                <div className="lumina-user-dropdown">
                  <div className="lumina-user-card">
                    <span className="lumina-avatar is-large">{initial}</span>
                    <div>
                      <strong>{userName}</strong>
                      <small>{userEmail || userRoleLabel}</small>
                    </div>
                  </div>
                  <Link to="/dashboard/profile" onClick={() => setIsUserOpen(false)}>
                    <UserRound size={16} /> Perfil privado
                  </Link>
                  <button type="button" className="lumina-logout-action" onClick={handleLogout}>
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
          <div className="lumina-badge"><ShieldCheck size={14} /> {isAdmin ? 'Modo administrativo' : 'Cliente privado'}</div>
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

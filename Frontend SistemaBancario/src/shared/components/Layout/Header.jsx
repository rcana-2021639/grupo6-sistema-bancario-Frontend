import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore';

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', end: true },
    { to: '/dashboard/accounts', label: 'Accounts' },
    { to: '/dashboard/transactions', label: 'Transactions' },
    { to: '/dashboard/cards', label: 'Cards' },
    { to: '/dashboard/loans', label: 'Loans' },
    { to: '/dashboard/profile', label: 'Profile' },
  ];

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
    `rounded-md px-3 py-2 text-sm font-medium transition hover:bg-[#f5f5f5] hover:text-[#0066cc] ${
      isActive ? 'bg-[#f5f5f5] text-[#0066cc]' : 'text-slate-600'
    }`
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-[#1e3a5f] text-sm font-bold text-white">
            SB
          </span>
          <span className="text-base font-semibold text-[#1e3a5f] sm:text-lg">Sistema Bancario</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-left transition hover:border-[#0066cc]"
                onClick={() => setIsUserOpen((value) => !value)}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f5f5f5] text-sm font-semibold text-[#1e3a5f]">
                  {initial}
                </span>
                <span className="max-w-40">
                  <span className="block truncate text-sm font-medium text-slate-900">{userName}</span>
                  {userEmail && <span className="block truncate text-xs text-slate-500">{userEmail}</span>}
                </span>
                <span className="text-xs text-slate-400">v</span>
              </button>

              {isUserOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
                  <Link
                    to="/dashboard/profile"
                    className="block rounded-md px-3 py-2 text-sm text-slate-700 transition hover:bg-[#f5f5f5] hover:text-[#0066cc]"
                    onClick={() => setIsUserOpen(false)}
                  >
                    Ver usuario
                  </Link>
                  <button
                    type="button"
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-[#f5f5f5] hover:text-[#0066cc]"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-[#0066cc] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e3a5f]"
            >
              Iniciar sesión
            </Link>
          )}
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-[#1e3a5f] transition hover:border-[#0066cc] md:hidden"
          onClick={() => setIsMenuOpen((value) => !value)}
          aria-label="Abrir menú"
        >
          <span className="text-xl leading-none">{isMenuOpen ? 'x' : '='}</span>
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
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
            <div className="mt-3 border-t border-slate-200 pt-3">
              <div className="mb-2 flex items-center gap-3 px-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f5f5f5] text-sm font-semibold text-[#1e3a5f]">
                  {initial}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{userName}</p>
                  {userEmail && <p className="truncate text-xs text-slate-500">{userEmail}</p>}
                </div>
              </div>
              <button
                type="button"
                className="mb-1 w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-[#f5f5f5] hover:text-[#0066cc]"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/dashboard/profile');
                }}
              >
                Ver usuario
              </button>
              <button
                type="button"
                className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-[#f5f5f5] hover:text-[#0066cc]"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;

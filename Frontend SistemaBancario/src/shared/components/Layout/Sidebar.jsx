import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/dashboard/accounts', label: 'Accounts' },
  { to: '/dashboard/transactions', label: 'Transactions' },
  { to: '/dashboard/cards', label: 'Cards' },
  { to: '/dashboard/loans', label: 'Loans' },
  { to: '/dashboard/profile', label: 'Profile' },
];

const Sidebar = ({ isOpen, onToggle }) => {
  const linkClass = ({ isActive }) => (
    `block rounded-md px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? 'bg-[#0066cc] text-white'
        : 'text-slate-600 hover:bg-[#f5f5f5] hover:text-[#0066cc]'
    }`
  );

  if (!isOpen) {
    return (
      <aside className="hidden min-h-[calc(100vh-65px)] w-14 shrink-0 border-r border-slate-200 bg-white lg:block">
        <div className="sticky top-16 flex justify-center px-2 py-4">
          <button
            type="button"
            onClick={onToggle}
            className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-[#f5f5f5] text-lg font-bold text-[#1e3a5f] transition hover:border-[#0066cc] hover:text-[#0066cc]"
            aria-label="Mostrar sidebar"
            title="Mostrar menu"
          >
            &gt;
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden min-h-[calc(100vh-65px)] w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="sticky top-16 space-y-6 px-5 py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#0066cc]">Navegacion</p>
            <h2 className="mt-1 text-lg font-bold text-[#1e3a5f]">Menu principal</h2>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-200 bg-[#f5f5f5] text-lg font-bold text-[#1e3a5f] transition hover:border-[#0066cc] hover:text-[#0066cc]"
            aria-label="Ocultar sidebar"
            title="Ocultar menu"
          >
            &lt;
          </button>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

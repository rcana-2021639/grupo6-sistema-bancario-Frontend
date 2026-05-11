import { NavLink } from 'react-router-dom';
import { BadgeDollarSign, Banknote, ChevronLeft, ChevronRight, CreditCard, FileText, Gauge, Landmark, Shield, Sparkles, UserRound, WalletCards } from 'lucide-react';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { isAdministrativeRole } from '../../utils/roles';

const iconMap = {
  dashboard: Gauge,
  accounts: Landmark,
  transactions: Banknote,
  cards: CreditCard,
  loans: BadgeDollarSign,
  statements: FileText,
  profile: UserRound,
};

const userNavItems = [
  { to: '/dashboard', label: 'Private Desk', key: 'dashboard', end: true },
  { to: '/dashboard/transactions', label: 'Capital Moves', key: 'transactions' },
  { to: '/dashboard/cards', label: 'Black Cards', key: 'cards' },
  { to: '/dashboard/loans', label: 'Credit Atelier', key: 'loans' },
  { to: '/dashboard/statements', label: 'Statements', key: 'statements' },
  { to: '/dashboard/profile', label: 'Identity Vault', key: 'profile' },
];

const adminNavItems = [
  { to: '/dashboard', label: 'Command Center', key: 'dashboard', end: true },
  { to: '/dashboard/accounts', label: 'Accounts Control', key: 'accounts' },
  { to: '/dashboard/transactions', label: 'Operations', key: 'transactions' },
  { to: '/dashboard/cards', label: 'Card Registry', key: 'cards' },
  { to: '/dashboard/loans', label: 'Credit Review', key: 'loans' },
  { to: '/dashboard/profile', label: 'Operator Profile', key: 'profile' },
];

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, role } = useAuthStore();
  const isAdmin = isAdministrativeRole(role || user?.role);
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const linkClass = ({ isActive }) => (
    `lumina-side-link ${isActive ? 'is-active' : ''}`
  );

  if (!isOpen) {
    return (
      <aside className="lumina-sidebar is-collapsed">
        <button type="button" onClick={onToggle} className="lumina-side-toggle" aria-label="Mostrar sidebar">
          <ChevronRight size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="lumina-sidebar">
      <div className="lumina-sidebar-inner">
        <div className="lumina-side-head">
          <div>
            <p>{isAdmin ? 'Administrative' : 'Private Suite'}</p>
            <h2>{isAdmin ? 'Control Room' : 'Wealth Console'}</h2>
          </div>
          <button type="button" onClick={onToggle} className="lumina-side-toggle" aria-label="Ocultar sidebar">
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="lumina-side-nav">
          {navItems.map((item) => {
            const Icon = iconMap[item.key] || Sparkles;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="lumina-side-card">
          {isAdmin ? <Shield size={22} /> : <WalletCards size={22} />}
          <strong>{isAdmin ? 'Operational Integrity' : 'Lumina Reserve'}</strong>
          <p>{isAdmin ? 'Herramientas administrativas listas para supervision.' : 'Experiencia privada para clientes de alto valor.'}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

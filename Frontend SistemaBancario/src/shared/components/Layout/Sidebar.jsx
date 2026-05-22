import { NavLink } from 'react-router-dom';
import { BadgeDollarSign, Banknote, ChevronLeft, ChevronRight, CreditCard, FileText, Gauge, Landmark, Package, Shield, Sparkles, UserRound, WalletCards } from 'lucide-react';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { isAdministrativeRole, isAdminRole } from '../../utils/roles';

const iconMap = {
  dashboard: Gauge,
  accounts: Landmark,
  transactions: Banknote,
  cards: CreditCard,
  loans: BadgeDollarSign,
  products: Package,
  statements: FileText,
  profile: UserRound,
};

const userNavItems = [
  { to: '/dashboard', label: 'Inicio privado', key: 'dashboard', end: true },
  { to: '/dashboard/transactions', label: 'Operaciones', key: 'transactions' },
  { to: '/dashboard/cards', label: 'Mis tarjetas', key: 'cards' },
  { to: '/dashboard/loans', label: 'Créditos', key: 'loans' },
  { to: '/dashboard/products', label: 'Productos', key: 'products' },
  { to: '/dashboard/statements', label: 'Estados', key: 'statements' },
  { to: '/dashboard/profile', label: 'Perfil', key: 'profile' },
];

const adminNavItems = [
  { to: '/dashboard', label: 'Centro de mando', key: 'dashboard', end: true },
  { to: '/dashboard/accounts', label: 'Control de cuentas', key: 'accounts' },
  { to: '/dashboard/transactions', label: 'Operaciones', key: 'transactions' },
  { to: '/dashboard/cards', label: 'Registro de tarjetas', key: 'cards', adminOnly: true },
  { to: '/dashboard/loans', label: 'Revision de credito', key: 'loans' },
  { to: '/dashboard/products', label: 'Productos', key: 'products' },
  { to: '/dashboard/statements', label: 'Estados de cuenta', key: 'statements' },
  { to: '/dashboard/profile', label: 'Perfil operativo', key: 'profile' },
];

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, role } = useAuthStore();
  const currentRole = role || user?.role;
  const isAdmin = isAdministrativeRole(currentRole);
  const canUseAdminOnlyViews = isAdminRole(currentRole);
  const navItems = isAdmin
    ? adminNavItems.filter((item) => !item.adminOnly || canUseAdminOnlyViews)
    : userNavItems;

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
            <p>{isAdmin ? 'Administración' : 'Suite privada'}</p>
            <h2>{isAdmin ? 'Sala operativa' : 'Consola financiera'}</h2>
          </div>
          <button type="button" onClick={onToggle} className="lumina-side-toggle" aria-label="Ocultar sidebar">
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="lumina-side-nav">
          {navItems.map((item, index) => {
            const Icon = iconMap[item.key] || Sparkles;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} style={{ '--side-index': index }}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="lumina-side-card">
          {isAdmin ? <Shield size={22} /> : <WalletCards size={22} />}
          <strong>{isAdmin ? 'Integridad operativa' : 'Reserva Lumina'}</strong>
          <p>{isAdmin ? 'Cuentas, actividad y control listos para supervisión.' : 'Experiencia privada para clientes de alto valor.'}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

export const ADMINISTRATIVE_ROLES = ['ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE'];

export const isAdministrativeRole = (role) => ADMINISTRATIVE_ROLES.includes(role);

export const isAdminRole = (role) => role === 'ADMIN_ROLE';

export const getDashboardPathByRole = (role) => (
  isAdministrativeRole(role) ? '/dashboard/admin' : '/dashboard/user'
);

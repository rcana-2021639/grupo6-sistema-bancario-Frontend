import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { getAllAccounts } from '../../../features/accounts/services/accountService';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const data = await getAllAccounts();
        setAccounts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Error al cargar las cuentas');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Calcular estadísticas
  const totalAccounts = accounts.length;
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const recentTransactions = [
    { id: 1, description: 'Transferencia recibida', amount: 500, date: '2024-01-15', type: 'income' },
    { id: 2, description: 'Pago de servicios', amount: -150, date: '2024-01-14', type: 'expense' },
    { id: 3, description: 'Depósito', amount: 1000, date: '2024-01-13', type: 'income' },
  ];

  return (
    <div className="feature-wrapper">
      <div className="dashboard">
        {/* Encabezado */}
        <div className="dashboard-header">
          <h1>¡Bienvenido, {user?.username}!</h1>
          <p className="dashboard-subtitle">Aquí está un resumen de tu actividad bancaria</p>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="dashboard-cards">
          <div className="stat-card">
            <div className="stat-icon accounts">💳</div>
            <div className="stat-content">
              <h3>Cuentas Activas</h3>
              <p className="stat-value">{totalAccounts}</p>
              <p className="stat-subtitle">cuentas registradas</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon balance">💰</div>
            <div className="stat-content">
              <h3>Saldo General</h3>
              <p className="stat-value">${totalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="stat-subtitle">en todas las cuentas</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon transactions">📊</div>
            <div className="stat-content">
              <h3>Transacciones</h3>
              <p className="stat-value">{recentTransactions.length}</p>
              <p className="stat-subtitle">últimos movimientos</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon status">✅</div>
            <div className="stat-content">
              <h3>Estado de Cuenta</h3>
              <p className="stat-value">Activo</p>
              <p className="stat-subtitle">todo en orden</p>
            </div>
          </div>
        </div>

        {/* Sección de Cuentas Rápidas */}
        {loading ? (
          <div className="loading">Cargando cuentas...</div>
        ) : error ? (
          <div className="error-message">Error: {error}</div>
        ) : accounts.length > 0 ? (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Mis Cuentas</h2>
              <a href="/accounts" className="view-all">Ver todas →</a>
            </div>
            <div className="accounts-grid">
              {accounts.slice(0, 3).map((account) => (
                <div key={account.id} className="account-card">
                  <div className="account-header">
                    <h3>{account.accountNumber || 'Cuenta'}</h3>
                    <span className={`status-badge ${account.isLocked ? 'locked' : 'active'}`}>
                      {account.isLocked ? '🔒 Bloqueada' : '✓ Activa'}
                    </span>
                  </div>
                  <div className="account-details">
                    <p className="account-type">{account.accountType || 'Cuenta Corriente'}</p>
                    <p className="account-currency">Moneda: {account.currency || 'ARS'}</p>
                  </div>
                  <div className="account-balance">
                    <p className="balance-label">Saldo</p>
                    <p className="balance-amount">${(account.balance || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <button className="view-btn">Ver Detalles</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-accounts">
            <p>No tienes cuentas registradas yet</p>
            <a href="/accounts" className="btn-create">+ Crear Cuenta</a>
          </div>
        )}

        {/* Transacciones Recientes */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Últimas Transacciones</h2>
            <a href="/transactions" className="view-all">Ver todas →</a>
          </div>
          <div className="transactions-table">
            <table>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.description}</td>
                    <td className={`amount ${tx.type}`}>
                      {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>{tx.date}</td>
                    <td>
                      <span className={`type-badge ${tx.type}`}>
                        {tx.type === 'income' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import { useState, useEffect } from 'react';
import { getAllAccounts, lockAccount } from '../../../features/accounts/services/accountService';
import './Accounts.css';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' o 'table'
  const [selectedAccount, setSelectedAccount] = useState(null);

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

  const handleLockAccount = async (accountId, isCurrentlyLocked) => {
    try {
      await lockAccount(accountId, !isCurrentlyLocked);
      setAccounts(accounts.map(acc =>
        acc.id === accountId ? { ...acc, isLocked: !isCurrentlyLocked } : acc
      ));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  };

  const getActiveAccounts = () => {
    return accounts.filter(acc => !acc.isLocked).length;
  };

  return (
    <div className="feature-wrapper">
      <div className="accounts-page">
        {/* Encabezado */}
        <div className="accounts-header">
          <h1>Mis Cuentas</h1>
          <p className="accounts-subtitle">Gestiona todas tus cuentas bancarias</p>
        </div>

        {/* Resumen */}
        <div className="accounts-summary">
          <div className="summary-item">
            <span className="summary-label">Total de Cuentas</span>
            <span className="summary-value">{accounts.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Activas</span>
            <span className="summary-value">{getActiveAccounts()}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Saldo Total</span>
            <span className="summary-value">${getTotalBalance().toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Controles */}
        <div className="accounts-controls">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              🗂️ Tarjetas
            </button>
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              📊 Tabla
            </button>
          </div>
          <button className="btn-primary">+ Nueva Cuenta</button>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="loading">Cargando cuentas...</div>
        ) : error ? (
          <div className="error-message">Error: {error}</div>
        ) : accounts.length === 0 ? (
          <div className="empty-state">
            <p>No tienes cuentas registradas</p>
            <button className="btn-primary">+ Crear tu primera cuenta</button>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="accounts-cards-grid">
            {accounts.map((account) => (
              <div key={account.id} className="account-card-full">
                <div className="card-header">
                  <div className="card-title">
                    <h3>{account.accountNumber || 'Cuenta'}</h3>
                    <span className="card-type">{account.accountType || 'Cuenta Corriente'}</span>
                  </div>
                  <span className={`status-badge ${account.isLocked ? 'locked' : 'active'}`}>
                    {account.isLocked ? '🔒' : '✓'}
                  </span>
                </div>

                <div className="card-body">
                  <div className="card-row">
                    <span className="card-label">Moneda</span>
                    <span className="card-value">{account.currency || 'ARS'}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Estado</span>
                    <span className={`card-status ${account.isLocked ? 'locked' : 'active'}`}>
                      {account.isLocked ? 'Bloqueada' : 'Activa'}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Crear</span>
                    <span className="card-value">{new Date(account.createdAt).toLocaleDateString('es-AR')}</span>
                  </div>
                </div>

                <div className="card-balance">
                  <p className="balance-label">Saldo Actual</p>
                  <p className="balance-amount">${(account.balance || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                <div className="card-actions">
                  <button className="btn-secondary">Ver Movimientos</button>
                  <button
                    className={`btn-action ${account.isLocked ? 'unlock' : 'lock'}`}
                    onClick={() => handleLockAccount(account.id, account.isLocked)}
                  >
                    {account.isLocked ? '🔓 Desbloquear' : '🔒 Bloquear'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="accounts-table-container">
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>Número de Cuenta</th>
                  <th>Tipo</th>
                  <th>Moneda</th>
                  <th>Saldo</th>
                  <th>Estado</th>
                  <th>Creada</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td className="account-number">{account.accountNumber}</td>
                    <td>{account.accountType || 'Cuenta Corriente'}</td>
                    <td>{account.currency || 'ARS'}</td>
                    <td className="balance">${(account.balance || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`status-badge ${account.isLocked ? 'locked' : 'active'}`}>
                        {account.isLocked ? 'Bloqueada' : 'Activa'}
                      </span>
                    </td>
                    <td>{new Date(account.createdAt).toLocaleDateString('es-AR')}</td>
                    <td className="actions">
                      <button className="action-btn" title="Ver detalles">👁️</button>
                      <button
                        className={`action-btn ${account.isLocked ? 'unlock' : 'lock'}`}
                        title={account.isLocked ? 'Desbloquear' : 'Bloquear'}
                        onClick={() => handleLockAccount(account.id, account.isLocked)}
                      >
                        {account.isLocked ? '🔓' : '🔒'}
                      </button>
                      <button className="action-btn delete" title="Eliminar">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Accounts;
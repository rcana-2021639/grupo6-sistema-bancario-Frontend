import { useCallback, useEffect, useMemo, useState } from 'react';
import { Gift, RotateCcw, Sparkles, TicketCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedTitle from '../../../shared/components/AnimatedTitle';
import { useAuthStore } from '../../auth/store/authStore';
import authService from '../../auth/services/authService';
import { isAdminRole } from '../../../shared/utils/roles';
import {
  benefitCatalog,
  getBenefitStateForUser,
  getUserDisplayName,
  getMyBenefitState,
  migrateLegacyBenefitsForUser,
  redeemBenefit,
  resetBenefitsForUser,
} from '../services/benefitsService';
import './Benefits.css';

const normalizeUser = (user) => ({
  id: user.id || user.Id || user._id || user.userId || user.email || user.Email || user.username || user.Username,
  name: getUserDisplayName(user),
  username: user.username || user.Username || '',
  email: user.email || user.Email || '',
});

const Benefits = () => {
  const { user, role } = useAuthStore();
  const canAdminBenefits = isAdminRole(role || user?.role);
  const [benefitState, setBenefitState] = useState({ redemptions: [], remaining: 2, maxRedemptions: 2 });
  const [loadingBenefits, setLoadingBenefits] = useState(true);
  const [clientUsers, setClientUsers] = useState([]);
  const [selectedUserKey, setSelectedUserKey] = useState('');
  const [selectedClientState, setSelectedClientState] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const redemptionsByBenefit = useMemo(() => (
    new Map(benefitState.redemptions.map((redemption) => [redemption.benefitId, redemption]))
  ), [benefitState.redemptions]);

  const redeemedCount = benefitState.redemptions.length;
  const progress = Math.min((redeemedCount / benefitState.maxRedemptions) * 100, 100);
  const selectedClient = clientUsers.find((client) => client.key === selectedUserKey);

  const refreshCurrentState = useCallback(async () => {
    try {
      setLoadingBenefits(true);
      await migrateLegacyBenefitsForUser(user);
      setBenefitState(await getMyBenefitState());
    } catch (error) {
      toast.error(error.message || 'No se pudieron cargar los beneficios');
    } finally {
      setLoadingBenefits(false);
    }
  }, [user]);

  const loadClientUsers = useCallback(async () => {
    if (!canAdminBenefits) return;

    try {
      setLoadingUsers(true);
      const response = await authService.getUsersByRole('USER_ROLE');
      const users = (response.data || response || []).map(normalizeUser);
      const uniqueUsers = [...new Map(users.map((item) => [String(item.id).toLowerCase(), item])).values()]
        .map((item) => ({ ...item, key: String(item.id || item.email || item.username).trim() }))
        .filter((item) => item.key && item.key !== 'anonymous');
      setClientUsers(uniqueUsers);
      setSelectedUserKey((current) => current || uniqueUsers[0]?.key || '');
    } catch (error) {
      toast.error(error.message || 'No se pudieron cargar los usuarios');
    } finally {
      setLoadingUsers(false);
    }
  }, [canAdminBenefits]);

  useEffect(() => {
    refreshCurrentState();
  }, [refreshCurrentState]);

  useEffect(() => {
    Promise.resolve().then(loadClientUsers);
  }, [loadClientUsers]);

  useEffect(() => {
    if (!selectedUserKey) {
      setSelectedClientState(null);
      return;
    }

    let active = true;
    getBenefitStateForUser(selectedUserKey)
      .then((state) => {
        if (active) setSelectedClientState(state);
      })
      .catch(() => {
        if (active) setSelectedClientState(null);
      });

    return () => {
      active = false;
    };
  }, [selectedUserKey]);

  const handleRedeem = async (benefit) => {
    try {
      const { redemption, userState, alreadyRedeemed } = await redeemBenefit({ benefitId: benefit.id });
      setBenefitState(userState);
      toast.success(alreadyRedeemed ? `Codigo disponible: ${redemption.code}` : `Beneficio canjeado: ${redemption.code}`);
    } catch (error) {
      toast.error(error.message || 'No se pudo canjear el beneficio');
    }
  };

  const handleResetBenefits = async () => {
    if (!selectedUserKey) {
      toast.error('Selecciona un usuario');
      return;
    }

    try {
      const state = await resetBenefitsForUser({ userIdentifier: selectedUserKey });
      setSelectedClientState(state);
      await refreshCurrentState();
      toast.success(`Cupo reiniciado para ${selectedClient?.name || 'el usuario seleccionado'}`);
    } catch (error) {
      toast.error(error.message || 'No se pudo reiniciar el cupo');
    }
  };

  return (
    <section className="lumina-page benefits-page">
      <div className="lumina-page-hero">
        <div className="lumina-hero-grid">
          <div>
            <p className="lumina-kicker">Beneficios Lumina</p>
            <AnimatedTitle className="lumina-title">Premios para clientes</AnimatedTitle>
            <p className="lumina-copy">Canjea hasta dos beneficios exclusivos por usuario. Cada premio genera un codigo unico para simular su uso con el aliado.</p>
          </div>

          <div className="lumina-wealth-card benefits-hero-card">
            <span>Cupos disponibles</span>
            <strong>{loadingBenefits ? '...' : benefitState.remaining}</strong>
            <p>{loadingBenefits ? 'Cargando beneficios...' : `${redeemedCount} de ${benefitState.maxRedemptions} beneficios canjeados`}</p>
            <div className="benefits-progress" aria-label="Progreso de beneficios canjeados">
              <div className="benefits-progress-track">
                <div className="benefits-progress-bar" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {canAdminBenefits && (
        <div className="lumina-panel benefits-admin-panel">
          <div className="benefits-panel-header">
            <div>
              <h2>Habilitar beneficios a clientes</h2>
              <p>Reinicia el cupo de un usuario para que pueda canjear nuevamente hasta 2 beneficios.</p>
            </div>
            <Sparkles size={20} />
          </div>

          <div className="benefits-admin-toolbar">
            <div className="benefits-admin-user">
              <label htmlFor="benefits-user-select">Usuario</label>
              <select
                id="benefits-user-select"
                className="lux-input"
                value={selectedUserKey}
                onChange={(event) => setSelectedUserKey(event.target.value)}
                disabled={loadingUsers || clientUsers.length === 0}
              >
                {clientUsers.length === 0 ? (
                  <option value="">{loadingUsers ? 'Cargando usuarios...' : 'No hay usuarios disponibles'}</option>
                ) : (
                  clientUsers.map((client) => (
                    <option key={client.key} value={client.key}>
                      {client.name} {client.email ? `- ${client.email}` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            <button type="button" className="lumina-button" onClick={handleResetBenefits} disabled={!selectedUserKey}>
              <RotateCcw size={16} /> Reiniciar cupo
            </button>
          </div>

          {selectedClientState && (
            <div className="benefits-admin-summary">
              <div>
                <span>Canjeados</span>
                <strong>{selectedClientState.redemptions.length}</strong>
              </div>
              <div>
                <span>Disponibles</span>
                <strong>{selectedClientState.remaining}</strong>
              </div>
              <div>
                <span>Usuario</span>
                <strong>{selectedClient?.username || selectedClient?.name || 'Cliente'}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="benefits-grid">
        {benefitCatalog.map((benefit) => {
          const redemption = redemptionsByBenefit.get(benefit.id);
          const isRedeemed = Boolean(redemption);
          const isLocked = !isRedeemed && benefitState.remaining <= 0;

          return (
            <article
              key={benefit.id}
              className={`lumina-list-item benefit-card ${isRedeemed ? 'is-redeemed' : ''} ${isLocked ? 'is-locked' : ''}`}
              style={{ '--benefit-accent': benefit.accent }}
            >
              <div className="benefit-card-head">
                <span className="lumina-badge">{benefit.category}</span>
                <div className="benefit-icon">
                  {isRedeemed ? <TicketCheck size={22} /> : <Gift size={22} />}
                </div>
              </div>

              <h3>{benefit.title}</h3>
              <div className="benefit-perk">{benefit.perk}</div>
              <p className="benefit-description">{benefit.description}</p>

              <div className="benefit-meta">
                <span className="lumina-badge">{benefit.partner}</span>
                <span className="lumina-badge">{isRedeemed ? 'Canjeado' : isLocked ? 'Cupo agotado' : 'Disponible'}</span>
              </div>

              {isRedeemed && (
                <div className="benefit-code">
                  <span>Codigo de canje</span>
                  <strong>{redemption.code}</strong>
                </div>
              )}

              <button
                type="button"
                className={`lumina-button ${isRedeemed ? 'secondary' : ''}`}
                disabled={isLocked}
                onClick={() => handleRedeem(benefit)}
              >
                {isRedeemed ? 'Ver codigo' : isLocked ? 'Limite alcanzado' : 'Canjear beneficio'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Benefits;

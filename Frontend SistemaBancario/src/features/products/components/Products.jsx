import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PackagePlus, ShoppingBag } from 'lucide-react';
import { getMyAccounts } from '../../accounts/services/accountService';
import { useAuthStore } from '../../auth/store/authStore';
import {
  createProduct,
  deleteProduct,
  getProducts,
  purchaseProduct,
  updateProduct,
} from '../../dashboard/services/productService';
import AnimatedTitle from '../../../shared/components/AnimatedTitle';
import { formatCompactMoney, formatMoney, getMoneyTitle } from '../../../shared/utils/money';

const initialProductForm = {
  name: '',
  description: '',
  category: 'general',
  price: '',
  currencyCode: 'GTQ',
  stock: '',
  status: 'activo',
  imageUrl: '',
};

const Modal = ({ title, children, onClose }) => (
  <div className="modal-backdrop">
    <div className="lumina-modal profile-modal">
      <div className="modal-header">
        <h2>{title}</h2>
        <button type="button" onClick={onClose} className="lumina-button secondary">Cerrar</button>
      </div>
      {children}
    </div>
  </div>
);

const Products = () => {
  const { role } = useAuthStore();
  const canManageProducts = ['ADMIN_ROLE', 'MANAGER_ROLE'].includes(role);
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState({ type: '', product: null });
  const [form, setForm] = useState(initialProductForm);
  const [purchaseForm, setPurchaseForm] = useState({ accountNumber: '', quantity: '1' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [productData, accountData] = await Promise.all([
        getProducts(),
        getMyAccounts().catch(() => []),
      ]);
      setProducts(Array.isArray(productData) ? productData : []);
      setAccounts(Array.isArray(accountData) ? accountData : []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'No se pudieron cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadData);
  }, [loadData]);

  const activeProducts = useMemo(() => (
    canManageProducts ? products : products.filter((product) => product.status === 'activo')
  ), [canManageProducts, products]);

  const selectedAccount = useMemo(() => (
    accounts.find((account) => account.accountNumber === purchaseForm.accountNumber) || null
  ), [accounts, purchaseForm.accountNumber]);

  const purchaseQuantity = Math.max(Number(purchaseForm.quantity) || 0, 0);
  const purchaseTotal = Number(modal.product?.price || 0) * purchaseQuantity;
  const productStock = Number(modal.product?.stock || 0);
  const sameCurrency = selectedAccount?.currencyCode === modal.product?.currencyCode;
  const projectedBalance = sameCurrency && selectedAccount
    ? Number(selectedAccount.balance || 0) - purchaseTotal
    : null;
  const purchaseBlockedReason = !accounts.length
    ? 'No hay cuentas disponibles para comprar.'
    : productStock <= 0
      ? 'Este producto no tiene stock disponible.'
      : purchaseQuantity < 1
        ? 'Ingresa una cantidad valida.'
        : purchaseQuantity > productStock
          ? 'La cantidad supera el stock disponible.'
          : '';

  const openCreate = () => {
    setForm(initialProductForm);
    setModal({ type: 'form', product: null });
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || 'general',
      price: product.price ?? '',
      currencyCode: product.currencyCode || 'GTQ',
      stock: product.stock ?? '',
      status: product.status || 'activo',
      imageUrl: product.imageUrl || '',
    });
    setModal({ type: 'form', product });
  };

  const openPurchase = (product) => {
    setPurchaseForm({ accountNumber: accounts[0]?.accountNumber || '', quantity: '1' });
    setModal({ type: 'purchase', product });
  };

  const closeModal = () => setModal({ type: '', product: null });

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      currencyCode: form.currencyCode.toUpperCase(),
    };

    try {
      setSaving(true);
      if (modal.product) {
        await updateProduct(modal.product._id || modal.product.id, payload);
        toast.success('Producto actualizado');
      } else {
        await createProduct(payload);
        toast.success('Producto creado');
      }
      closeModal();
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Desactivar ${product.name}?`)) return;
    try {
      await deleteProduct(product._id || product.id);
      toast.success('Producto desactivado');
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'No se pudo desactivar');
    }
  };

  const handlePurchase = async (event) => {
    event.preventDefault();
    if (purchaseBlockedReason) {
      toast.error(purchaseBlockedReason);
      return;
    }

    try {
      setSaving(true);
      await purchaseProduct(modal.product._id || modal.product.id, {
        accountNumber: purchaseForm.accountNumber,
        quantity: purchaseQuantity,
      });
      toast.success('Compra realizada');
      closeModal();
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'No se pudo comprar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="lumina-page">
      <div className="lumina-page-hero">
        <div className="lumina-hero-grid">
          <div>
            <p className="lumina-kicker">Catalogo exclusivo</p>
            <AnimatedTitle className="lumina-title">Productos y servicios</AnimatedTitle>
            <p className="lumina-copy">Catalogo exclusivo para clientes del banco con compras debitadas de cuenta.</p>
            {canManageProducts && (
              <button type="button" onClick={openCreate} className="lumina-button">
                <PackagePlus size={16} /> Nuevo producto
              </button>
            )}
          </div>
          <div className="lumina-wealth-card">
            <span>Catalogo activo</span>
            <strong>{loading ? '...' : activeProducts.length}</strong>
            <p>Productos y servicios disponibles</p>
          </div>
        </div>
      </div>

      <div className="lumina-panel">
        {loading ? (
          <div className="lumina-empty">Cargando catalogo...</div>
        ) : activeProducts.length === 0 ? (
          <div className="lumina-empty">No hay productos o servicios disponibles.</div>
        ) : (
          <div className="loan-grid">
            {activeProducts.map((product) => {
              const stock = Number(product.stock || 0);
              return (
                <article key={product._id || product.id} className="lumina-list-item loan-card product-card">
                  <div className="loan-card-top">
                    <span className="lumina-badge">{product.category || 'general'}</span>
                    <ShoppingBag size={18} />
                  </div>
                  <strong>{product.name}</strong>
                  <p>{product.description || 'Sin descripcion'}</p>
                  <div className="product-facts">
                    <span>Precio unitario</span>
                    <strong title={getMoneyTitle(product.price, product.currencyCode)}>{formatCompactMoney(product.price, product.currencyCode)}</strong>
                  </div>
                  <div className="product-meta-grid">
                    <div>
                      <span>Stock</span>
                      <strong>{stock}</strong>
                    </div>
                    <div>
                      <span>Estado</span>
                      <strong>{product.status}</strong>
                    </div>
                    <div>
                      <span>Moneda</span>
                      <strong>{product.currencyCode}</strong>
                    </div>
                  </div>
                  <div className="lux-actions">
                    {canManageProducts ? (
                      <>
                        <button type="button" onClick={() => openEdit(product)} className="lumina-button secondary">Editar</button>
                        <button type="button" onClick={() => handleDelete(product)} className="lumina-button secondary">Desactivar</button>
                      </>
                    ) : (
                      <button type="button" onClick={() => openPurchase(product)} className="lumina-button" disabled={stock <= 0}>
                        {stock <= 0 ? 'Sin stock' : 'Comprar'}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {modal.type === 'form' && (
        <Modal title={modal.product ? 'Editar producto o servicio' : 'Nuevo producto o servicio'} onClose={closeModal}>
          <form onSubmit={handleSaveProduct} className="lux-form">
            <label>Nombre<input className="lux-input" name="name" value={form.name} onChange={handleFormChange} required /></label>
            <label>Descripcion<input className="lux-input" name="description" value={form.description} onChange={handleFormChange} /></label>
            <label>Categoria<input className="lux-input" name="category" value={form.category} onChange={handleFormChange} /></label>
            <label>Precio<input className="lux-input" type="number" min="0.01" step="0.01" name="price" value={form.price} onChange={handleFormChange} required /></label>
            <label>Moneda<input className="lux-input" name="currencyCode" value={form.currencyCode} onChange={handleFormChange} required /></label>
            <label>Stock<input className="lux-input" type="number" min="0" name="stock" value={form.stock} onChange={handleFormChange} required /></label>
            <label>Estado<select className="lux-input" name="status" value={form.status} onChange={handleFormChange}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></label>
            <label>Imagen URL<input className="lux-input" name="imageUrl" value={form.imageUrl} onChange={handleFormChange} /></label>
            <div className="lux-actions">
              <button type="button" onClick={closeModal} className="lumina-button secondary">Cancelar</button>
              <button type="submit" disabled={saving} className="lumina-button">{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </form>
        </Modal>
      )}

      {modal.type === 'purchase' && (
        <Modal title={`Comprar ${modal.product.name}`} onClose={closeModal}>
          <form onSubmit={handlePurchase} className="lux-form">
            <div className="purchase-summary">
              <div>
                <span>Producto</span>
                <strong>{modal.product.name}</strong>
              </div>
              <div>
                <span>Precio unitario</span>
                <strong title={getMoneyTitle(modal.product.price, modal.product.currencyCode)}>{formatMoney(modal.product.price, modal.product.currencyCode)}</strong>
              </div>
              <div>
                <span>Stock disponible</span>
                <strong>{productStock}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong title={getMoneyTitle(purchaseTotal, modal.product.currencyCode)}>{formatMoney(purchaseTotal, modal.product.currencyCode)}</strong>
              </div>
            </div>

            <label>Cuenta
              <select className="lux-input" value={purchaseForm.accountNumber} onChange={(event) => setPurchaseForm((current) => ({ ...current, accountNumber: event.target.value }))} required>
                {accounts.map((account) => (
                  <option key={account.accountNumber} value={account.accountNumber}>
                    {account.accountNumber} - {formatMoney(account.balance, account.currencyCode)}
                  </option>
                ))}
              </select>
            </label>

            {selectedAccount && (
              <div className="purchase-summary">
                <div>
                  <span>Saldo actual</span>
                  <strong title={getMoneyTitle(selectedAccount.balance, selectedAccount.currencyCode)}>{formatMoney(selectedAccount.balance, selectedAccount.currencyCode)}</strong>
                </div>
                <div>
                  <span>Saldo estimado</span>
                  <strong title={projectedBalance !== null ? getMoneyTitle(projectedBalance, selectedAccount.currencyCode) : undefined}>
                    {projectedBalance !== null
                      ? formatMoney(projectedBalance, selectedAccount.currencyCode)
                      : 'Conversion al confirmar'}
                  </strong>
                </div>
              </div>
            )}

            <label>Cantidad
              <input
                className="lux-input"
                type="number"
                min="1"
                max={productStock || 1}
                value={purchaseForm.quantity}
                onChange={(event) => setPurchaseForm((current) => ({ ...current, quantity: event.target.value }))}
                required
              />
            </label>

            {purchaseBlockedReason && <div className="info-box warning-box">{purchaseBlockedReason}</div>}

            <div className="lux-actions">
              <button type="button" onClick={closeModal} className="lumina-button secondary">Cancelar</button>
              <button type="submit" disabled={saving || Boolean(purchaseBlockedReason)} className="lumina-button">{saving ? 'Procesando...' : 'Comprar'}</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
};

export default Products;

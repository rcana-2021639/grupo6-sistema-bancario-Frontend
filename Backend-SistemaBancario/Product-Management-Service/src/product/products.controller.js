import Product from './products.model.js';
import Account from '../shared/models/account.model.js';
import Transaction from '../shared/models/transaction.model.js';
import { convertAmount } from '../../../Transaction-Processing-Service/helpers/conversionCurrency.helper.js';

const roundToTwoDecimals = (value) => Number(Number(value || 0).toFixed(2));

const getRequesterContext = (req) => ({
    role: req.user?.role,
    userId: req.user?.sub || req.user?.userId || req.userId || ''
});

const normalizeProductPayload = (payload) => ({
    name: String(payload.name || '').trim(),
    description: String(payload.description || '').trim(),
    category: String(payload.category || 'general').trim(),
    price: Number(payload.price),
    currencyCode: String(payload.currencyCode || 'GTQ').toUpperCase().trim(),
    stock: Number(payload.stock ?? 0),
    status: payload.status || 'activo',
    imageUrl: String(payload.imageUrl || '').trim()
});

export const createProduct = async (req, res) => {
    try {
        const productData = normalizeProductPayload(req.body);
        productData.createdByUserId = req.user?.sub || req.user?.userId || req.userId || '';

        const product = await Product.create(productData);

        return res.status(201).json({
            success: true,
            message: 'Producto o servicio creado exitosamente',
            data: product
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error al crear el producto o servicio',
            error: error.message
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 50, status = 'activo', search = '' } = req.query;
        const filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (search) {
            filter.$text = { $search: String(search).trim() };
        }

        const numericPage = Math.max(parseInt(page, 10) || 1, 1);
        const numericLimit = Math.max(parseInt(limit, 10) || 50, 1);

        const products = await Product.find(filter)
            .limit(numericLimit)
            .skip((numericPage - 1) * numericLimit)
            .sort({ createdAt: -1 });
        const total = await Product.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: products,
            pagination: {
                currentPage: numericPage,
                totalPages: Math.ceil(total / numericLimit),
                totalRecords: total,
                limit: numericLimit
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener productos o servicios',
            error: error.message
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto o servicio no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al buscar producto o servicio',
            error: error.message
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            normalizeProductPayload(req.body),
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto o servicio no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Producto o servicio actualizado exitosamente',
            data: product
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error al actualizar producto o servicio',
            error: error.message
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status: 'inactivo' },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto o servicio no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Producto o servicio desactivado exitosamente',
            data: product
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error al desactivar producto o servicio',
            error: error.message
        });
    }
};

export const purchaseProduct = async (req, res) => {
    try {
        const { role, userId } = getRequesterContext(req);
        const accountNumber = String(req.body.accountNumber || '').toUpperCase().trim();
        const quantity = Math.max(parseInt(req.body.quantity, 10) || 1, 1);

        const [product, account] = await Promise.all([
            Product.findById(req.params.id),
            Account.findOne({ accountNumber })
        ]);

        if (!product || product.status !== 'activo') {
            return res.status(404).json({
                success: false,
                message: 'Producto o servicio no disponible'
            });
        }

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        if (role === 'USER_ROLE' && String(account.userId) !== String(userId)) {
            return res.status(403).json({
                success: false,
                message: 'No puedes comprar con una cuenta que no te pertenece'
            });
        }

        if (account.status !== 'activa') {
            return res.status(400).json({
                success: false,
                message: 'La cuenta debe estar activa para comprar'
            });
        }

        if (Number(product.stock) < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Stock insuficiente para esta compra'
            });
        }

        const totalProductCurrency = roundToTwoDecimals(Number(product.price) * quantity);
        const debitAmount = product.currencyCode !== account.currencyCode
            ? await convertAmount(totalProductCurrency, product.currencyCode, account.currencyCode)
            : totalProductCurrency;
        const debitRounded = roundToTwoDecimals(debitAmount);

        if (Number(account.balance) < debitRounded) {
            return res.status(400).json({
                success: false,
                message: 'Saldo insuficiente para realizar la compra'
            });
        }

        const previousBalance = roundToTwoDecimals(account.balance);
        account.balance = roundToTwoDecimals(Number(account.balance) - debitRounded);
        product.stock = Number(product.stock) - quantity;

        await Promise.all([account.save(), product.save()]);

        const transaction = await Transaction.create({
            sourceAccountNumber: account.accountNumber,
            destinationAccountNumber: '',
            transactionType: 'pago_servicio',
            amount: totalProductCurrency,
            currencyCode: product.currencyCode,
            description: `Compra: ${product.name} x${quantity}`,
            status: 'exitosa',
            previousBalance,
            newBalance: account.balance,
            executedByUserId: userId,
            referenceType: 'product',
            referenceId: String(product._id),
            metadata: { quantity }
        });

        return res.status(201).json({
            success: true,
            message: 'Compra realizada exitosamente',
            data: {
                product,
                transaction,
                accountBalance: account.balance
            }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error al realizar compra',
            error: error.message
        });
    }
};

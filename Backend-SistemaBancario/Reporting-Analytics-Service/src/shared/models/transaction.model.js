'use strict'

import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    sourceAccountNumber: {
        type: String,
        trim: true
    },
    destinationAccountNumber: {
        type: String,
        trim: true
    },
    transactionType: {
        type: String,
        required: [true, 'El tipo de transaccion es requerido'],
        enum: {
            values: ['deposito', 'retiro', 'transferencia', 'pago_servicio', 'pago_prestamo', 'compra_tarjeta'],
            message: 'Tipo de transaccion no valido'
        }
    },
    amount: {
        type: Number,
        required: [true, 'El monto es requerido'],
        min: [0.01, 'El monto debe ser mayor a 0']
    },
    currencyCode: {
        type: String,
        required: [true, 'Currency code is required'],
        uppercase: true,
        trim: true,
        match: [/^[A-Z]{3}$/, 'Currency code must have format ABC']
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        trim: true,
        maxLength: [200, 'Descripcion no puede exceder 200 caracteres']
    },
    status: {
        type: String,
        enum: {
            values: ['exitosa', 'pendiente', 'rechazada', 'reversada'],
            message: 'Status no valido'
        },
        default: 'exitosa'
    },
    previousBalance: {
        type: Number,
        default: 0
    },
    newBalance: {
        type: Number,
        default: 0
    },
    executedByUserId: {
        type: String,
        required: [true, 'Executing user is required']
    },
    favorito: {
        type: Boolean,
        default: false
    },
    alias: {
        type: String,
        trim: true,
        maxLength: [80, 'El alias no puede exceder 80 caracteres'],
        default: ''
    }
}, {
    timestamps: true,
    versionKey: false
});

transactionSchema.index({ sourceAccountNumber: 1 });
transactionSchema.index({ destinationAccountNumber: 1 });
transactionSchema.index({ transactionType: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ transactionDate: -1 });
transactionSchema.index({ executedByUserId: 1, favorito: 1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

'use strict'

import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
    accountNumber: {
        type: String,
        required: [true, 'El numero de cuenta es obligatorio']
    },
    amount: {
        type: Number,
        required: [true, 'El monto es obligatorio']
    },
    currencyCode: {
        type: String,
        default: ''
    },
    userId: {
        type: String,
        required: [true, 'El ID del usuario es requerido']
    },
    description: {
        type: String,
        default: 'Retiro en efectivo'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

withdrawalSchema.index({ accountNumber: 1 });

export default mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);

'use strict'

import mongoose from "mongoose";

const cardSchema = mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'El usuario es requerido'],
        match: [/^usr_[A-Za-z0-9]+$/, 'Formato de userId invalido']
    },
    accountNumber: {
        type: String,
        required: [true, 'El numero de cuenta es requerido'],
        trim: true,
        uppercase: true,
        match: [/^[A-Z]{3}-\d{3}-\d{4}$/, 'El numero de cuenta debe tener formato ABC-000-0000']
    },
    cardNumber: {
        type: String,
        required: [true, 'El numero de tarjeta es requerido'],
        unique: true,
        trim: true,
        match: [/^\d{16}$/, 'El numero de tarjeta debe tener 16 digitos']
    },
    cardType: {
        type: String,
        required: [true, 'El tipo de tarjeta es requerido'],
        enum: {
            values: ['debito', 'credito'],
            message: 'Tipo de tarjeta no valido'
        }
    },
    cvv: {
        type: String,
        required: [true, 'El CVV es requerido'],
        trim: true,
        match: [/^\d{3,4}$/, 'El CVV debe tener 3 o 4 digitos']
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    expirationDate: {
        type: Date,
        required: [true, 'La fecha de vencimiento es requerida']
    },
    creditLimit: {
        type: Number,
        default: 60000,
        min: [0, 'El limite debe ser positivo']
    },
    availableBalance: {
        type: Number,
        default: 0,
        min: [0, 'El saldo disponible no puede ser negativo']
    },
    currentCycleBalance: {
        type: Number,
        default: 0,
        min: [0, 'El balance del ciclo no puede ser negativo']
    },
    billingCycle: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: {
            values: ['activa', 'bloqueada', 'vencida', 'cancelada'],
            message: 'Estado no valido'
        },
        default: 'activa'
    },
    pin: {
        type: String,
        required: [true, 'El PIN es requerido'],
        trim: true,
        match: [/^\d{4}$/, 'El PIN debe tener 4 digitos']
    }
}, {
    timestamps: true,
    versionKey: false
});

cardSchema.index({ userId: 1 });
cardSchema.index({ accountNumber: 1 });
cardSchema.index({ status: 1 });

export default mongoose.model('Card', cardSchema);

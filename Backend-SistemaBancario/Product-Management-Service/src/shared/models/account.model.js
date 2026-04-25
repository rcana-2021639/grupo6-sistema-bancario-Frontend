'use strict'

import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
    accountNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^[A-Z]{3}-\d{3}-\d{4}$/, 'El numero de cuenta debe tener formato ABC-000-0000']
    },
    accountType: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    openingDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['activa', 'inactiva', 'bloqueada'],
        default: 'activa'
    },
    dailyWithdrawalLimit: Number,
    annualInterestRate: Number,
    currencyCode: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    dpi: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    jobName: {
        type: String,
        required: true,
        trim: true
    },
    monthlyIncome: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

accountSchema.index({ userId: 1 });
accountSchema.index({ status: 1 });

export default mongoose.models.Account || mongoose.model('Account', accountSchema);

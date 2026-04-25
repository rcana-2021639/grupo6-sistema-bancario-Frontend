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
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currencyCode: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['exitosa', 'pendiente', 'rechazada', 'reversada'],
        default: 'exitosa'
    }
}, {
    timestamps: true,
    versionKey: false
});

transactionSchema.index({ sourceAccountNumber: 1 });
transactionSchema.index({ destinationAccountNumber: 1 });
transactionSchema.index({ status: 1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

'use strict';

import mongoose from 'mongoose';

const cardSchema = mongoose.Schema({
    userId: String,
    accountNumber: String,
    cardNumber: String,
    cardType: {
        type: String,
        enum: ['debito', 'credito']
    },
    cvv: String,
    issueDate: Date,
    expirationDate: Date,
    creditLimit: Number,
    availableBalance: Number,
    currentCycleBalance: Number,
    billingCycle: String,
    status: String,
    pin: String
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.models.Card || mongoose.model('Card', cardSchema);

'use strict';

import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
    name: String,
    description: String,
    category: String,
    price: Number,
    currencyCode: String,
    stock: Number,
    status: String,
    imageUrl: String,
    createdByUserId: String
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);

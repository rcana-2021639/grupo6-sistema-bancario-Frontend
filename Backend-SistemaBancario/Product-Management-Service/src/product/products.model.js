'use strict'

import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del producto o servicio es requerido'],
        trim: true,
        maxLength: [80, 'El nombre no puede exceder 80 caracteres']
    },
    description: {
        type: String,
        trim: true,
        maxLength: [300, 'La descripcion no puede exceder 300 caracteres'],
        default: ''
    },
    category: {
        type: String,
        trim: true,
        maxLength: [60, 'La categoria no puede exceder 60 caracteres'],
        default: 'general'
    },
    price: {
        type: Number,
        required: [true, 'El precio es requerido'],
        min: [0.01, 'El precio debe ser mayor a 0']
    },
    currencyCode: {
        type: String,
        required: [true, 'La moneda es requerida'],
        uppercase: true,
        trim: true,
        match: [/^[A-Z]{3}$/, 'La moneda debe tener formato ABC'],
        default: 'GTQ'
    },
    stock: {
        type: Number,
        min: [0, 'El stock no puede ser negativo'],
        default: 0
    },
    status: {
        type: String,
        enum: {
            values: ['activo', 'inactivo'],
            message: 'Estado no valido'
        },
        default: 'activo'
    },
    imageUrl: {
        type: String,
        trim: true,
        default: ''
    },
    createdByUserId: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true,
    versionKey: false
});

productSchema.index({ status: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.model('Product', productSchema);

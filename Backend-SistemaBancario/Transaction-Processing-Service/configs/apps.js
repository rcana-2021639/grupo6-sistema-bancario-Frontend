'use strict'
import express, { response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';

import transactionRoutes from '../src/transaction/transaction.routes.js';
import withdrawalRoutes from '../src/withdrawal/withdrawal.routes.js';
import depositsRoutes from '../src/deposits/deposits.routes.js';
import { registerOpenApiRoutes } from '../../docs/register-openapi-routes.js';
import { buildTransactionServiceOpenApi } from '../../docs/specs/transaction-service.openapi.js';

const BASE_PATH = '/api/v1';

const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(morgan('dev'));
    app.use((req, res, next) => {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: 'Servicio temporalmente no disponible',
                error: 'La conexion con MongoDB no esta lista'
            });
        }

        next();
    });
}

//rutas para conectar los enpoint
const routes = (app) => {
    const openApiSpec = buildTransactionServiceOpenApi({
        port: process.env.PORT,
        basePath: BASE_PATH
    });

    registerOpenApiRoutes(app, BASE_PATH, openApiSpec, import.meta.url);
    app.use(`${BASE_PATH}/transaction`, transactionRoutes);
    app.use(`${BASE_PATH}/withdrawal`, withdrawalRoutes);
    app.use(`${BASE_PATH}/deposits`, depositsRoutes);

    app.get(`${BASE_PATH}/health`, (request, response) => {
        const databaseStatusMap = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        response.status(200).json({
            status: mongoose.connection.readyState === 1 ? 'Healthy' : 'Degraded',
            timestamp: new Date().toISOString(),
            service: 'Sistema Bancario API',
            database: databaseStatusMap[mongoose.connection.readyState] || 'unknown'
        })
    })

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado'
        })
    })
}

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT;
    app.set('trust proxy', 1);

    try {
        await dbConnection();
        middlewares(app);
        routes(app);

        app.listen(PORT, () => {
            console.log(`Sistema Bancario Admin Server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
            console.log(`Swagger docs: http://localhost:${PORT}${BASE_PATH}/docs`);
        })
    } catch (error) {
        console.error(`Error starting Admin Server: ${error.message}`);
        process.exit(1);
    }
}

'use strict'
import express, { response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { seedCommonCurrencies } from '../helpers/currency-seed.helper.js';

import currencyRoutes from '../src/coins/coins.routes.js';
import accountsRoutes from '../src/accounts/accounts.routes.js';
import accountLockRoutes from '../src/accountLock/accountLock.routes.js';
import { registerOpenApiRoutes } from '../../docs/register-openapi-routes.js';
import { buildAccountServiceOpenApi } from '../../docs/specs/account-service.openapi.js';


const BASE_PATH = '/api/v1';

const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(morgan('dev'));
}

//rutas para conectar los enpoint
const routes = (app) => {
    const openApiSpec = buildAccountServiceOpenApi({
        port: process.env.PORT,
        basePath: BASE_PATH
    });

    registerOpenApiRoutes(app, BASE_PATH, openApiSpec, import.meta.url);
    app.use(`${BASE_PATH}/coins`, currencyRoutes);
    app.use(`${BASE_PATH}/accounts`, accountsRoutes);
    app.use(`${BASE_PATH}/accountLocks`, accountLockRoutes);



    app.get(`${BASE_PATH}/health`, (request, response) => {
        response.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'Sistema Bancario API'
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
        await seedCommonCurrencies();
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

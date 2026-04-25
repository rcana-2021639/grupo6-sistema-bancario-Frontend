'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
// Ensure models are registered before DB sync
import '../src/users/user.model.js';
import '../src/auth/role.model.js';
import { requestLimit } from '../middlewares/request-limit.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import {
    errorHandler,
    notFound,
} from '../middlewares/server-genericError-handler.js';
import authRoutes from '../src/auth/auth.routes.js';
import userRoutes from '../src/users/user.routes.js';
import { registerOpenApiRoutes } from '../../docs/register-openapi-routes.js';
import { buildAuthServiceOpenApi } from '../../docs/specs/auth-service.openapi.js';

const BASE_PATH = '/api/v1';

const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(requestLimit);
    app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

const routes = (app) => {
    const openApiSpec = buildAuthServiceOpenApi({
        port: process.env.PORT,
        basePath: BASE_PATH
    });

    registerOpenApiRoutes(app, BASE_PATH, openApiSpec, import.meta.url);
    app.use(`${BASE_PATH}/auth`, authRoutes);
    app.use(`${BASE_PATH}/users`, userRoutes);

    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'SistemaBancario Authentication Service',
        });
    });
    // 404 handler (standardized)
    app.use(notFound);
};

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT;
    app.set('trust proxy', 1); // Corregido el typo 'trus'

    try {
        await dbConnection();

        // Seed de roles y admin
        const { seedRoles } = await import('../helpers/role-seed.js');
        await seedRoles();

        const { seedDefaultAdmin } = await import('../helpers/admin-seed.js');
        await seedDefaultAdmin();

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


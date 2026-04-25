import { createRequire } from 'module';

export const registerOpenApiRoutes = (app, basePath, openApiSpec, moduleUrl) => {
    const require = createRequire(moduleUrl);
    const swaggerUi = require('swagger-ui-express');
    const docsPath = `${basePath}/docs`;
    const jsonPath = `${basePath}/openapi.json`;

    app.get(jsonPath, (_req, res) => {
        res.json(openApiSpec);
    });

    app.use(
        docsPath,
        swaggerUi.serve,
        swaggerUi.setup(openApiSpec, {
            explorer: true,
            customSiteTitle: `${openApiSpec.info.title} Docs`,
            swaggerOptions: {
                url: jsonPath
            }
        })
    );
};

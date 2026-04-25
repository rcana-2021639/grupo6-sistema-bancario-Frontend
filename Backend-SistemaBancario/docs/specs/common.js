const jsonResponse = (description) => ({
    description,
    content: {
        'application/json': {
            schema: {
                type: 'object'
            }
        }
    }
});

const objectBody = (description) => ({
    required: false,
    content: {
        'application/json': {
            schema: {
                type: 'object',
                description
            }
        }
    }
});

export const bearerSecurity = [{ bearerAuth: [] }];

export const pathParameter = (name, description) => ({
    in: 'path',
    name,
    required: true,
    description,
    schema: {
        type: 'string'
    }
});

export const createOperation = ({
    summary,
    description,
    tags,
    parameters = [],
    secured = false,
    hasBody = false,
    bodyDescription = 'Payload en formato JSON',
    extraResponses = {}
}) => ({
    tags,
    summary,
    description,
    ...(parameters.length ? { parameters } : {}),
    ...(secured ? { security: bearerSecurity } : {}),
    ...(hasBody ? { requestBody: objectBody(bodyDescription) } : {}),
    responses: {
        200: jsonResponse('Operacion completada correctamente'),
        201: jsonResponse('Recurso creado correctamente'),
        400: jsonResponse('Solicitud invalida'),
        401: jsonResponse('Autenticacion requerida o token invalido'),
        404: jsonResponse('Recurso no encontrado'),
        500: jsonResponse('Error interno del servidor'),
        ...extraResponses
    }
});

export const createServiceSpec = ({
    title,
    version = '1.0.0',
    description,
    port,
    basePath,
    tags,
    paths
}) => ({
        openapi: '3.0.3',
        info: {
            title,
            version,
            description
        },
        servers: [
            {
                url: `http://localhost:${port || '3000'}${basePath}`,
                description: 'Servidor local'
            }
        ],
        tags,
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        paths
    });

import { createOperation, createServiceSpec, pathParameter } from './common.js';

export const buildReportingServiceOpenApi = ({ port, basePath }) =>
    createServiceSpec({
        title: 'Reporting Analytics Service API',
        description: 'Documentacion de estados de cuenta y reportes.',
        port,
        basePath,
        tags: [
            { name: 'Account Statements', description: 'Estados de cuenta y exportacion PDF.' },
            { name: 'Health', description: 'Estado operativo del servicio.' }
        ],
        paths: {
            '/accountStatements/create': {
                post: createOperation({
                    tags: ['Account Statements'],
                    summary: 'Crear estado de cuenta',
                    description: 'Genera un nuevo estado de cuenta.',
                    hasBody: true,
                    bodyDescription: 'Datos del estado de cuenta a crear'
                })
            },
            '/accountStatements': {
                get: createOperation({
                    tags: ['Account Statements'],
                    summary: 'Listar estados de cuenta',
                    description: 'Obtiene todos los estados de cuenta registrados.'
                })
            },
            '/accountStatements/account/{accountNumber}/pdf': {
                get: createOperation({
                    tags: ['Account Statements'],
                    summary: 'Descargar PDF por cuenta',
                    description: 'Genera o descarga el PDF del estado de cuenta asociado a una cuenta.',
                    secured: true,
                    parameters: [pathParameter('accountNumber', 'Numero de cuenta')],
                    extraResponses: {
                        200: {
                            description: 'PDF generado o respuesta exitosa del estado de cuenta'
                        }
                    }
                })
            },
            '/accountStatements/{id}': {
                get: createOperation({
                    tags: ['Account Statements'],
                    summary: 'Obtener estado de cuenta por id',
                    description: 'Consulta un estado de cuenta especifico.',
                    parameters: [pathParameter('id', 'Identificador del estado de cuenta')]
                }),
                put: createOperation({
                    tags: ['Account Statements'],
                    summary: 'Actualizar estado de cuenta',
                    description: 'Actualiza la informacion de un estado de cuenta.',
                    parameters: [pathParameter('id', 'Identificador del estado de cuenta')],
                    hasBody: true,
                    bodyDescription: 'Campos del estado de cuenta a modificar'
                }),
                delete: createOperation({
                    tags: ['Account Statements'],
                    summary: 'Eliminar estado de cuenta',
                    description: 'Elimina un estado de cuenta existente.',
                    parameters: [pathParameter('id', 'Identificador del estado de cuenta')]
                })
            },
            '/Health': {
                get: createOperation({
                    tags: ['Health'],
                    summary: 'Health check',
                    description: 'Verifica que el servicio de reportes este activo.'
                })
            }
        }
    });

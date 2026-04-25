import { createOperation, createServiceSpec, pathParameter } from './common.js';

export const buildProductServiceOpenApi = ({ port, basePath }) =>
    createServiceSpec({
        title: 'Product Management Service API',
        description: 'Documentacion de tarjetas y prestamos bancarios.',
        port,
        basePath,
        tags: [
            { name: 'Cards', description: 'Administracion de tarjetas.' },
            { name: 'Loans', description: 'Administracion de prestamos.' },
            { name: 'Health', description: 'Estado operativo del servicio.' }
        ],
        paths: {
            '/cards/create': {
                post: createOperation({
                    tags: ['Cards'],
                    summary: 'Crear tarjeta',
                    description: 'Registra una nueva tarjeta bancaria.',
                    hasBody: true,
                    bodyDescription: 'Datos de la tarjeta a crear'
                })
            },
            '/cards': {
                get: createOperation({
                    tags: ['Cards'],
                    summary: 'Listar tarjetas',
                    description: 'Obtiene el listado de tarjetas registradas.',
                    secured: true
                })
            },
            '/cards/{id}': {
                get: createOperation({
                    tags: ['Cards'],
                    summary: 'Obtener tarjeta por id',
                    description: 'Consulta una tarjeta especifica.',
                    parameters: [pathParameter('id', 'Identificador de la tarjeta')]
                }),
                put: createOperation({
                    tags: ['Cards'],
                    summary: 'Actualizar tarjeta',
                    description: 'Modifica los datos de una tarjeta existente.',
                    parameters: [pathParameter('id', 'Identificador de la tarjeta')],
                    hasBody: true,
                    bodyDescription: 'Campos de la tarjeta a actualizar'
                }),
                delete: createOperation({
                    tags: ['Cards'],
                    summary: 'Eliminar tarjeta',
                    description: 'Elimina una tarjeta del sistema.',
                    parameters: [pathParameter('id', 'Identificador de la tarjeta')]
                })
            },
            '/cards/{id}/status': {
                patch: createOperation({
                    tags: ['Cards'],
                    summary: 'Cambiar estado de tarjeta',
                    description: 'Activa o bloquea una tarjeta.',
                    parameters: [pathParameter('id', 'Identificador de la tarjeta')],
                    hasBody: true,
                    bodyDescription: 'Nuevo estado de la tarjeta'
                })
            },
            '/loan/create': {
                post: createOperation({
                    tags: ['Loans'],
                    summary: 'Crear prestamo',
                    description: 'Registra un nuevo prestamo.',
                    hasBody: true,
                    bodyDescription: 'Datos del prestamo a crear'
                })
            },
            '/loan': {
                get: createOperation({
                    tags: ['Loans'],
                    summary: 'Listar prestamos',
                    description: 'Obtiene todos los prestamos disponibles.',
                    secured: true
                })
            },
            '/loan/{id}': {
                get: createOperation({
                    tags: ['Loans'],
                    summary: 'Obtener prestamo por id',
                    description: 'Consulta el detalle de un prestamo.',
                    secured: true,
                    parameters: [pathParameter('id', 'Identificador del prestamo')]
                }),
                put: createOperation({
                    tags: ['Loans'],
                    summary: 'Actualizar prestamo',
                    description: 'Modifica la informacion de un prestamo.',
                    secured: true,
                    parameters: [pathParameter('id', 'Identificador del prestamo')],
                    hasBody: true,
                    bodyDescription: 'Campos del prestamo a modificar'
                }),
                delete: createOperation({
                    tags: ['Loans'],
                    summary: 'Eliminar prestamo',
                    description: 'Elimina un prestamo existente.',
                    secured: true,
                    parameters: [pathParameter('id', 'Identificador del prestamo')]
                })
            },
            '/health': {
                get: createOperation({
                    tags: ['Health'],
                    summary: 'Health check',
                    description: 'Verifica que el servicio de productos este activo.'
                })
            }
        }
    });

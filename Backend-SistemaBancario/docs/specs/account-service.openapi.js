import { createOperation, createServiceSpec, pathParameter } from './common.js';

export const buildAccountServiceOpenApi = ({ port, basePath }) =>
    createServiceSpec({
        title: 'Account Management Service API',
        description: 'Documentacion de cuentas, monedas y bloqueos de cuenta.',
        port,
        basePath,
        tags: [
            { name: 'Coins', description: 'Monedas configuradas en el sistema.' },
            { name: 'Accounts', description: 'Cuentas bancarias y su estado.' },
            { name: 'Account Locks', description: 'Bloqueos aplicados a cuentas.' },
            { name: 'Health', description: 'Estado operativo del servicio.' }
        ],
        paths: {
            '/coins/create': {
                post: createOperation({
                    tags: ['Coins'],
                    summary: 'Crear moneda',
                    description: 'Registra una nueva moneda disponible en el catalogo.',
                    hasBody: true,
                    bodyDescription: 'Datos de la moneda a crear'
                })
            },
            '/coins': {
                get: createOperation({
                    tags: ['Coins'],
                    summary: 'Listar monedas',
                    description: 'Obtiene todas las monedas registradas.'
                })
            },
            '/coins/{id}': {
                get: createOperation({
                    tags: ['Coins'],
                    summary: 'Obtener moneda por id',
                    description: 'Consulta el detalle de una moneda especifica.',
                    parameters: [pathParameter('id', 'Identificador de la moneda')]
                }),
                put: createOperation({
                    tags: ['Coins'],
                    summary: 'Actualizar moneda',
                    description: 'Modifica la informacion principal de una moneda.',
                    parameters: [pathParameter('id', 'Identificador de la moneda')],
                    hasBody: true,
                    bodyDescription: 'Campos de la moneda a actualizar'
                }),
                delete: createOperation({
                    tags: ['Coins'],
                    summary: 'Eliminar moneda',
                    description: 'Elimina una moneda existente del sistema.',
                    parameters: [pathParameter('id', 'Identificador de la moneda')]
                })
            },
            '/coins/{id}/status': {
                patch: createOperation({
                    tags: ['Coins'],
                    summary: 'Cambiar estado de moneda',
                    description: 'Activa o desactiva una moneda registrada.',
                    parameters: [pathParameter('id', 'Identificador de la moneda')],
                    hasBody: true,
                    bodyDescription: 'Nuevo estado de la moneda'
                })
            },
            '/accounts/create': {
                post: createOperation({
                    tags: ['Accounts'],
                    summary: 'Crear cuenta',
                    description: 'Registra una nueva cuenta bancaria.',
                    secured: true,
                    hasBody: true,
                    bodyDescription: 'Datos de la cuenta a crear'
                })
            },
            '/accounts': {
                get: createOperation({
                    tags: ['Accounts'],
                    summary: 'Listar cuentas',
                    description: 'Devuelve el listado de cuentas con acceso por rol.',
                    secured: true
                })
            },
            '/accounts/{accountNumber}': {
                get: createOperation({
                    tags: ['Accounts'],
                    summary: 'Obtener cuenta por numero',
                    description: 'Consulta una cuenta usando su numero.',
                    secured: true,
                    parameters: [pathParameter('accountNumber', 'Numero de cuenta')]
                }),
                put: createOperation({
                    tags: ['Accounts'],
                    summary: 'Actualizar cuenta',
                    description: 'Actualiza informacion editable de una cuenta.',
                    secured: true,
                    parameters: [pathParameter('accountNumber', 'Numero de cuenta')],
                    hasBody: true,
                    bodyDescription: 'Campos de la cuenta a modificar'
                }),
                delete: createOperation({
                    tags: ['Accounts'],
                    summary: 'Eliminar cuenta',
                    description: 'Elimina una cuenta existente.',
                    secured: true,
                    parameters: [pathParameter('accountNumber', 'Numero de cuenta')]
                })
            },
            '/accounts/{accountNumber}/status': {
                patch: createOperation({
                    tags: ['Accounts'],
                    summary: 'Cambiar estado de cuenta',
                    description: 'Actualiza el estado operativo de una cuenta.',
                    parameters: [pathParameter('accountNumber', 'Numero de cuenta')],
                    hasBody: true,
                    bodyDescription: 'Nuevo estado de la cuenta'
                })
            },
            '/accountLocks/create': {
                post: createOperation({
                    tags: ['Account Locks'],
                    summary: 'Crear bloqueo',
                    description: 'Registra un bloqueo para una cuenta.',
                    hasBody: true,
                    bodyDescription: 'Datos del bloqueo de cuenta'
                })
            },
            '/accountLocks': {
                get: createOperation({
                    tags: ['Account Locks'],
                    summary: 'Listar bloqueos',
                    description: 'Obtiene todos los bloqueos registrados.',
                    secured: true
                })
            },
            '/accountLocks/{id}': {
                get: createOperation({
                    tags: ['Account Locks'],
                    summary: 'Obtener bloqueo por id',
                    description: 'Consulta un bloqueo puntual.',
                    secured: true,
                    parameters: [pathParameter('id', 'Identificador del bloqueo')]
                }),
                put: createOperation({
                    tags: ['Account Locks'],
                    summary: 'Actualizar bloqueo',
                    description: 'Actualiza la informacion de un bloqueo existente.',
                    parameters: [pathParameter('id', 'Identificador del bloqueo')],
                    hasBody: true,
                    bodyDescription: 'Campos del bloqueo a modificar'
                }),
                delete: createOperation({
                    tags: ['Account Locks'],
                    summary: 'Eliminar bloqueo',
                    description: 'Elimina un bloqueo de cuenta.',
                    parameters: [pathParameter('id', 'Identificador del bloqueo')]
                })
            },
            '/health': {
                get: createOperation({
                    tags: ['Health'],
                    summary: 'Health check',
                    description: 'Verifica que el servicio de cuentas este activo.'
                })
            }
        }
    });

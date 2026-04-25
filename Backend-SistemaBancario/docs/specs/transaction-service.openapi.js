import { createOperation, createServiceSpec, pathParameter } from './common.js';

export const buildTransactionServiceOpenApi = ({ port, basePath }) =>
    createServiceSpec({
        title: 'Transaction Processing Service API',
        description: 'Documentacion de transacciones, retiros y depositos.',
        port,
        basePath,
        tags: [
            { name: 'Transactions', description: 'Transferencias y favoritos.' },
            { name: 'Withdrawals', description: 'Retiros y consulta de movimientos.' },
            { name: 'Deposits', description: 'Depositos y reversiones.' },
            { name: 'Health', description: 'Estado operativo del servicio.' }
        ],
        paths: {
            '/transaction/create': {
                post: createOperation({
                    tags: ['Transactions'],
                    summary: 'Crear transaccion',
                    description: 'Registra una nueva transaccion bancaria.',
                    secured: true,
                    hasBody: true,
                    bodyDescription: 'Datos de la transaccion a crear'
                })
            },
            '/transaction': {
                get: createOperation({
                    tags: ['Transactions'],
                    summary: 'Listar transacciones',
                    description: 'Obtiene el listado completo de transacciones.',
                    secured: true
                })
            },
            '/transaction/favorites': {
                get: createOperation({
                    tags: ['Transactions'],
                    summary: 'Listar favoritos',
                    description: 'Consulta las transacciones favoritas del usuario o rol permitido.',
                    secured: true
                })
            },
            '/transaction/{id}': {
                get: createOperation({
                    tags: ['Transactions'],
                    summary: 'Obtener transaccion por id',
                    description: 'Consulta una transaccion puntual.',
                    secured: true,
                    parameters: [pathParameter('id', 'Identificador de la transaccion')]
                }),
                put: createOperation({
                    tags: ['Transactions'],
                    summary: 'Actualizar transaccion',
                    description: 'Actualiza los datos editables de una transaccion.',
                    secured: true,
                    parameters: [pathParameter('id', 'Identificador de la transaccion')],
                    hasBody: true,
                    bodyDescription: 'Campos de la transaccion a modificar'
                }),
                delete: createOperation({
                    tags: ['Transactions'],
                    summary: 'Eliminar transaccion',
                    description: 'Elimina una transaccion existente.',
                    secured: true,
                    parameters: [pathParameter('id', 'Identificador de la transaccion')]
                })
            },
            '/withdrawal': {
                post: createOperation({
                    tags: ['Withdrawals'],
                    summary: 'Crear retiro',
                    description: 'Realiza un retiro sobre una cuenta bancaria.',
                    secured: true,
                    hasBody: true,
                    bodyDescription: 'Datos del retiro a procesar'
                })
            },
            '/withdrawal/statement/{id}': {
                get: createOperation({
                    tags: ['Withdrawals'],
                    summary: 'Consultar estado de cuenta',
                    description: 'Obtiene el estado de cuenta usando el numero de cuenta.',
                    secured: true,
                    parameters: [pathParameter('id', 'Numero de cuenta')]
                })
            },
            '/deposits/create': {
                post: createOperation({
                    tags: ['Deposits'],
                    summary: 'Crear deposito',
                    description: 'Registra un nuevo deposito.',
                    hasBody: true,
                    bodyDescription: 'Datos del deposito a crear'
                })
            },
            '/deposits': {
                get: createOperation({
                    tags: ['Deposits'],
                    summary: 'Listar depositos',
                    description: 'Obtiene todos los depositos registrados.'
                })
            },
            '/deposits/{id}': {
                get: createOperation({
                    tags: ['Deposits'],
                    summary: 'Obtener deposito por id',
                    description: 'Consulta un deposito especifico.',
                    parameters: [pathParameter('id', 'Identificador del deposito')]
                }),
                put: createOperation({
                    tags: ['Deposits'],
                    summary: 'Actualizar deposito',
                    description: 'Actualiza el monto u otros datos permitidos del deposito.',
                    parameters: [pathParameter('id', 'Identificador del deposito')],
                    hasBody: true,
                    bodyDescription: 'Campos del deposito a modificar'
                }),
                delete: createOperation({
                    tags: ['Deposits'],
                    summary: 'Eliminar deposito',
                    description: 'Elimina un deposito existente.',
                    parameters: [pathParameter('id', 'Identificador del deposito')]
                })
            },
            '/deposits/{id}/revert': {
                patch: createOperation({
                    tags: ['Deposits'],
                    summary: 'Revertir deposito',
                    description: 'Revierte un deposito previamente registrado.',
                    parameters: [pathParameter('id', 'Identificador del deposito')],
                    hasBody: true,
                    bodyDescription: 'Motivo o datos de la reversion'
                })
            },
            '/health': {
                get: createOperation({
                    tags: ['Health'],
                    summary: 'Health check',
                    description: 'Verifica que el servicio de transacciones este activo.'
                })
            }
        }
    });

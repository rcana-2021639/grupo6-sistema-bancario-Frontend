import { createOperation, createServiceSpec, pathParameter } from './common.js';

export const buildAuthServiceOpenApi = ({ port, basePath }) =>
    createServiceSpec({
        title: 'Auth Service API',
        description: 'Documentacion de autenticacion, perfil y gestion de roles.',
        port,
        basePath,
        tags: [
            { name: 'Auth', description: 'Autenticacion y recuperacion de acceso.' },
            { name: 'Users', description: 'Roles y consultas de usuarios.' },
            { name: 'Health', description: 'Estado operativo del servicio.' }
        ],
        paths: {
            '/auth/register': {
                post: createOperation({
                    tags: ['Auth'],
                    summary: 'Registrar usuario',
                    description: 'Crea un usuario nuevo y acepta foto de perfil.',
                    hasBody: true,
                    bodyDescription: 'Datos del usuario a registrar'
                })
            },
            '/auth/login': {
                post: createOperation({
                    tags: ['Auth'],
                    summary: 'Iniciar sesion',
                    description: 'Autentica al usuario y devuelve credenciales de acceso.',
                    hasBody: true,
                    bodyDescription: 'Credenciales de inicio de sesion'
                })
            },
            '/auth/verify-email': {
                post: createOperation({
                    tags: ['Auth'],
                    summary: 'Verificar correo',
                    description: 'Confirma la cuenta mediante el token de verificacion.',
                    hasBody: true,
                    bodyDescription: 'Token o datos de verificacion de correo'
                })
            },
            '/auth/resend-verification': {
                post: createOperation({
                    tags: ['Auth'],
                    summary: 'Reenviar verificacion',
                    description: 'Reenvia el correo de verificacion al usuario.',
                    hasBody: true,
                    bodyDescription: 'Identificador del usuario o correo'
                })
            },
            '/auth/forgot-password': {
                post: createOperation({
                    tags: ['Auth'],
                    summary: 'Solicitar restablecimiento',
                    description: 'Genera el flujo para recuperar la contrasena.',
                    hasBody: true,
                    bodyDescription: 'Correo o identificador del usuario'
                })
            },
            '/auth/reset-password': {
                post: createOperation({
                    tags: ['Auth'],
                    summary: 'Restablecer contrasena',
                    description: 'Actualiza la contrasena usando un token valido.',
                    hasBody: true,
                    bodyDescription: 'Token y nueva contrasena'
                })
            },
            '/auth/profile': {
                get: createOperation({
                    tags: ['Auth'],
                    summary: 'Obtener perfil',
                    description: 'Devuelve el perfil del usuario autenticado.',
                    secured: true
                })
            },
            '/users/{userId}/role': {
                put: createOperation({
                    tags: ['Users'],
                    summary: 'Actualizar rol principal',
                    description: 'Cambia el rol principal de un usuario.',
                    parameters: [pathParameter('userId', 'Identificador del usuario')],
                    hasBody: true,
                    bodyDescription: 'Nuevo rol del usuario'
                })
            },
            '/users/change-role/{userId}': {
                put: createOperation({
                    tags: ['Users'],
                    summary: 'Cambiar rol',
                    description: 'Ejecuta el flujo alterno de cambio de rol para un usuario.',
                    parameters: [pathParameter('userId', 'Identificador del usuario')],
                    hasBody: true,
                    bodyDescription: 'Nuevo rol o datos del cambio'
                })
            },
            '/users/{userId}/roles': {
                get: createOperation({
                    tags: ['Users'],
                    summary: 'Obtener roles del usuario',
                    description: 'Lista los roles asociados a un usuario.',
                    parameters: [pathParameter('userId', 'Identificador del usuario')]
                })
            },
            '/users/by-role/{roleName}': {
                get: createOperation({
                    tags: ['Users'],
                    summary: 'Listar usuarios por rol',
                    description: 'Busca usuarios filtrando por nombre de rol.',
                    parameters: [pathParameter('roleName', 'Nombre del rol')]
                })
            },
            '/health': {
                get: createOperation({
                    tags: ['Health'],
                    summary: 'Health check',
                    description: 'Verifica que el servicio de autenticacion este activo.'
                })
            }
        }
    });

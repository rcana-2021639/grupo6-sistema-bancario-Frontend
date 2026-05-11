import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { checkUserExists, createNewUser, findUserById } from '../../helpers/user-db.js';
import {
    getUserRoleNames,
    getUsersByRole as repoGetUsersByRole,
    setUserSingleRole,
} from '../../helpers/role-db.js';
import { ALLOWED_ROLES, ADMIN_ROLE } from '../../helpers/role-constants.js';
import { buildUserResponse } from '../../utils/user-helpers.js';
import { sequelize } from '../../configs/db.js';
import { User, UserEmail, UserProfile } from './user.model.js';
const ALLOWED_ROLES_MESSAGE ='Role not allowed. Use ADMIN_ROLE, MANAGER_ROLE, USER_ROLE or ATM_ROLE';
const ADMINISTRATIVE_ROLES = ['ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE'];

const ensureNotProtectedAdmin = async (userId) => {
    const roles = await getUserRoleNames(userId);
    if (roles.includes(ADMIN_ROLE)) {
        const error = new Error('Los usuarios ADMIN_ROLE estan protegidos y no pueden editarse, desactivarse ni eliminarse desde administracion');
        error.status = 403;
        throw error;
    }
};

const ensureAdmin = async (req) => {
    const currentUserId = req.userId;
    if (!currentUserId) return false;
    const roles =
        req.user?.UserRoles?.map((ur) => ur.Role?.Name).filter(Boolean) ??
        (await getUserRoleNames(currentUserId));
    return roles.includes(ADMIN_ROLE);
};

export const updateUserRole = [
    validateJWT,
    asyncHandler(async (req, res) => {
        if (!(await ensureAdmin(req))) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { userId } = req.params;
        const { roleName, role } = req.body || {};

        const normalized = (roleName || role || '').trim().toUpperCase();
        if (!ALLOWED_ROLES.includes(normalized)) {
        return res.status(400).json({
            success: false,
            message: ALLOWED_ROLES_MESSAGE,
        });
        }
        if (normalized === ADMIN_ROLE) {
        return res.status(403).json({
            success: false,
            message: 'Solo se pueden crear administradores desde /users/administrative; no se permite convertir usuarios existentes a ADMIN_ROLE',
        });
        }

        const user = await findUserById(userId);
        if (!user) {
        return res
            .status(404)
            .json({ success: false, message: 'User not found' });
        }

        const { updatedUser } = await setUserSingleRole(
        user,
        normalized,
        sequelize
        );

        return res.status(200).json(buildUserResponse(updatedUser));
    }),
];

export const getUserRoles = [
    validateJWT,
    asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const roles = await getUserRoleNames(userId);
        return res.status(200).json(roles);
    }),
];

export const getUsersByRole = [
    validateJWT,
    asyncHandler(async (req, res) => {
        if (!(await ensureAdmin(req))) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { roleName } = req.params;
        const normalized = (roleName || '').trim().toUpperCase();
        if (!ALLOWED_ROLES.includes(normalized)) {
        return res.status(400).json({
            success: false,
            message: ALLOWED_ROLES_MESSAGE,
        });
        }

        const users = await repoGetUsersByRole(normalized);
        const payload = users.map(buildUserResponse);
        return res.status(200).json(payload);
    }),
];

export const changeRole = updateUserRole;

export const createAdministrativeUser = [
    validateJWT,
    asyncHandler(async (req, res) => {
        if (!(await ensureAdmin(req))) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { name, surname, username, email, password, phone, roleName, role } = req.body || {};
        const normalizedRole = (roleName || role || '').trim().toUpperCase();

        if (!ADMINISTRATIVE_ROLES.includes(normalizedRole)) {
            return res.status(400).json({
                success: false,
                message: 'Role not allowed. Use ADMIN_ROLE, MANAGER_ROLE or ATM_ROLE',
            });
        }

        const user = await createNewUser({
            name,
            surname: surname || 'Administrativo',
            username,
            email,
            password,
            phone,
        });

        await User.update({ Status: true }, { where: { Id: user.Id } });
        await UserEmail.update(
            { EmailVerified: true, EmailVerificationToken: null, EmailVerificationTokenExpiry: null },
            { where: { UserId: user.Id } }
        );

        const activeUser = await findUserById(user.Id);
        const { updatedUser } = await setUserSingleRole(activeUser, normalizedRole, sequelize);

        return res.status(201).json({
            success: true,
            message: 'Usuario administrativo creado exitosamente',
            data: buildUserResponse(updatedUser),
        });
    }),
];

export const createClientUser = [
    validateJWT,
    asyncHandler(async (req, res) => {
        if (!(await ensureAdmin(req))) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { name, surname, username, email, password, phone } = req.body || {};
        const missingFields = ['name', 'username', 'email', 'password', 'phone']
            .filter((field) => !String(req.body?.[field] ?? '').trim());

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Completa todos los campos obligatorios del cliente',
                missingFields,
            });
        }

        if (String(password).length < 8) {
            return res.status(400).json({
                success: false,
                message: 'La contrasena temporal debe tener al menos 8 caracteres',
            });
        }

        if (!/^\d{8}$/.test(String(phone))) {
            return res.status(400).json({
                success: false,
                message: 'El telefono debe tener exactamente 8 digitos',
            });
        }

        if (await checkUserExists(email, username)) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un usuario con este correo o nombre de usuario',
            });
        }

        const user = await createNewUser({
            name,
            surname: surname || 'Cliente',
            username,
            email,
            password,
            phone,
        });

        await User.update({ Status: true }, { where: { Id: user.Id } });
        await UserEmail.update(
            { EmailVerified: true, EmailVerificationToken: null, EmailVerificationTokenExpiry: null },
            { where: { UserId: user.Id } }
        );

        const activeUser = await findUserById(user.Id);

        return res.status(201).json({
            success: true,
            message: 'Cliente creado exitosamente',
            data: buildUserResponse(activeUser),
        });
    }),
];

export const updateUser = [
    validateJWT,
    asyncHandler(async (req, res) => {
        if (!(await ensureAdmin(req))) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { userId } = req.params;
        const { name, surname, username, email, phone, roleName, role } = req.body || {};
        const requestedRole = roleName ?? role;
        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await ensureNotProtectedAdmin(userId);

        await User.update(
            {
                ...(name !== undefined && { Name: name }),
                ...(surname !== undefined && { Surname: surname }),
                ...(username !== undefined && { Username: String(username).toLowerCase() }),
                ...(email !== undefined && { Email: String(email).toLowerCase() }),
            },
            { where: { Id: userId } }
        );

        if (phone !== undefined) {
            await UserProfile.update({ Phone: phone }, { where: { UserId: userId } });
        }

        let updatedUser = await findUserById(userId);

        if (requestedRole !== undefined) {
            const normalizedRole = String(requestedRole || '').trim().toUpperCase();
            if (!ADMINISTRATIVE_ROLES.includes(normalizedRole)) {
                return res.status(400).json({
                    success: false,
                    message: 'Role not allowed. Use ADMIN_ROLE, MANAGER_ROLE or ATM_ROLE',
                });
            }
            if (normalizedRole === ADMIN_ROLE) {
                return res.status(403).json({
                    success: false,
                    message: 'No se permite convertir usuarios existentes a ADMIN_ROLE desde este endpoint',
                });
            }
            const result = await setUserSingleRole(updatedUser, normalizedRole, sequelize);
            updatedUser = result.updatedUser;
        }

        return res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: buildUserResponse(updatedUser),
        });
    }),
];

export const changeUserStatus = [
    validateJWT,
    asyncHandler(async (req, res) => {
        if (!(await ensureAdmin(req))) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { userId } = req.params;
        const { status } = req.body || {};
        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await ensureNotProtectedAdmin(userId);

        await User.update({ Status: Boolean(status) }, { where: { Id: userId } });
        const updatedUser = await findUserById(userId);

        return res.status(200).json({
            success: true,
            message: 'Estado actualizado exitosamente',
            data: buildUserResponse(updatedUser),
        });
    }),
];

export const deleteUser = [
    validateJWT,
    asyncHandler(async (req, res) => {
        if (!(await ensureAdmin(req))) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { userId } = req.params;
        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await ensureNotProtectedAdmin(userId);

        await sequelize.transaction(async (transaction) => {
            await User.destroy({ where: { Id: userId }, transaction });
        });

        return res.status(200).json({
            success: true,
            message: 'Usuario eliminado exitosamente',
        });
    }),
];

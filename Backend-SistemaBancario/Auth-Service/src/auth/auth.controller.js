import {
    registerUserHelper,
    loginUserHelper,
    verifyEmailHelper,
    resendVerificationEmailHelper,
    forgotPasswordHelper,
    resetPasswordHelper,
    updateUserProfileHelper,
    changeUserPasswordHelper,
} from '../../helpers/auth-operations.js';
import { getUserProfileHelper } from '../../helpers/profile-operations.js';
import { uploadImage } from '../../helpers/cloudinary-service.js';
import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { findUserById } from '../../helpers/user-db.js';
import { verifyPassword } from '../../utils/password-utils.js';

export const register = asyncHandler(async (req, res) => {
    try {
        // Agregar la imagen de perfil si fue subida
        const userData = {
            ...req.body,
            profilePicture: req.file ? req.file.path.replace(/\\/g, '/') : null,
        };

        const result = await registerUserHelper(userData);

        res.status(201).json(result);
    } catch (error) {
        console.error('Error in register controller:', error);

        let statusCode = 400;
        if (
            error.message.includes('ya está registrado') ||
            error.message.includes('ya está en uso') ||
            error.message.includes('Ya existe un usuario')
        ) {
            statusCode = 409; // Conflict
        }

        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error en el registro',
            error: error.message,
        });
    }
});

export const login = asyncHandler(async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        const result = await loginUserHelper(emailOrUsername, password);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in login controller:', error);

        let statusCode = 401;
        if (
            error.message.includes('bloqueada') ||
            error.message.includes('desactivada')
        ) {
            statusCode = 423; // Locked
        }

        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error en el login',
            error: error.message,
        });
    }
});

export const verifyEmail = asyncHandler(async (req, res) => {
    try {
        const { token } = req.body;
        const result = await verifyEmailHelper(token);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in verifyEmail controller:', error);

        let statusCode = 400;
        if (error.message.includes('no encontrado')) {
            statusCode = 404;
        } else if (
            error.message.includes('inválido') ||
            error.message.includes('expirado')
        ) {
            statusCode = 401;
        }

        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error en la verificación',
            error: error.message,
        });
    }
});

export const resendVerification = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;
        const result = await resendVerificationEmailHelper(email);

        // Check result.success to determine status code
        if (!result.success) {
            if (result.message.includes('no encontrado')) {
                return res.status(404).json(result);
            }
            if (result.message.includes('ya ha sido verificado')) {
                return res.status(400).json(result);
            }
            // Email sending failed
            return res.status(503).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in resendVerification controller:', error);

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
        });
    }
});

export const forgotPassword = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;
        const result = await forgotPasswordHelper(email);

        // forgotPassword always returns success for security, even if user not found
        // But if email sending fails, we should return 503
        if (!result.success && result.data?.initiated === false) {
            return res.status(503).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in forgotPassword controller:', error);

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
        });
    }
});

export const resetPassword = asyncHandler(async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const result = await resetPasswordHelper(token, newPassword);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in resetPassword controller:', error);

        let statusCode = 400;
        if (error.message.includes('no encontrado')) {
            statusCode = 404;
        } else if (
            error.message.includes('inválido') ||
            error.message.includes('expirado')
        ) {
            statusCode = 401;
        }

        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error al resetear contraseña',
            error: error.message,
        });
    }
});

export const getProfile = asyncHandler(async (req, res) => {
    const userId = req.userId; // Viene del middleware validateJWT
    const user = await getUserProfileHelper(userId);

    // Respuesta estandarizada con envelope
    return res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: user,
    });
});

export const getProfileById = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'El userId es requerido',
        });
    }

    const user = await getUserProfileHelper(userId);

    // Respuesta estandarizada con envelope
    return res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: user,
    });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { name, surname, email, username, phone } = req.body;

    const updatedUser = await updateUserProfileHelper(userId, {
        name,
        surname,
        email,
        username,
        phone,
    });

    return res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: updatedUser,
    });
});

export const updateProfilePicture = asyncHandler(async (req, res) => {
    const userId = req.userId;

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No se ha enviado ninguna imagen',
        });
    }

    const localFilePath = req.file.path.replace(/\\/g, '/');
    const fileName = req.file.filename || `profile-${Date.now()}`;

    try {
        const uploadedUrl = await uploadImage(localFilePath, fileName);
        const updatedUser = await updateUserProfileHelper(userId, {
            profilePicture: uploadedUrl,
        });

        return res.status(200).json({
            success: true,
            message: 'Foto de perfil actualizada exitosamente',
            data: updatedUser,
        });
    } catch (error) {
        console.error('Error actualizando foto de perfil:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al subir la imagen de perfil',
            error: error.message,
        });
    }
});

export const changePassword = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Contraseña actual y nueva contraseña son requeridas',
        });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'La nueva contraseña debe tener al menos 8 caracteres',
        });
    }

    await changeUserPasswordHelper(userId, currentPassword, newPassword);

    return res.status(200).json({
        success: true,
        message: 'Contraseña cambiada exitosamente',
    });
});

export const verifyPasswordForSensitiveAction = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'La contrasena es requerida',
        });
    }

    const user = await findUserById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado',
        });
    }

    const isValidPassword = await verifyPassword(user.Password, password);
    if (!isValidPassword) {
        return res.status(401).json({
            success: false,
            message: 'La contrasena ingresada no es correcta',
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Contrasena verificada',
    });
});

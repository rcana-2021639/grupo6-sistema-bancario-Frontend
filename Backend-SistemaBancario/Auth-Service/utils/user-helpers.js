import {
    getFullImageUrl,
    getDefaultAvatarPath,
} from '../helpers/cloudinary-service.js';

const ADMINISTRATIVE_ROLES = ['ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE'];

export const getPrimaryRoleName = (user) => {
    const roleNames = user.UserRoles?.map((userRole) => userRole.Role?.Name).filter(Boolean) || [];
    return roleNames.find((roleName) => ADMINISTRATIVE_ROLES.includes(roleName)) || roleNames[0] || 'USER_ROLE';
};

export const buildUserResponse = (user) => {
    // Obtener la URL de la imagen de perfil
    const profilePictureUrl =
        user.UserProfile && user.UserProfile.ProfilePicture
        ? getFullImageUrl(user.UserProfile.ProfilePicture)
        : getFullImageUrl(getDefaultAvatarPath());

    return {
        id: user.Id,
        name: user.Name,
        surname: user.Surname,
        username: user.Username,
        email: user.Email,
        phone:
        user.UserProfile && user.UserProfile.Phone ? user.UserProfile.Phone : '',
        profilePicture: profilePictureUrl,
        role: getPrimaryRoleName(user),
        status: user.Status,
        isEmailVerified: user.UserEmail ? user.UserEmail.EmailVerified : false,
        createdAt: user.CreatedAt,
        updatedAt: user.UpdatedAt,
    };
};

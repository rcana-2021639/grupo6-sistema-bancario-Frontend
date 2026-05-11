import { User, UserProfile, UserEmail, UserPasswordReset } from '../src/users/user.model.js';
import { Role, UserRole } from '../src/auth/role.model.js';
import { ADMIN_ROLE } from './role-constants.js';
import { hashPassword } from '../utils/password-utils.js';

export const seedDefaultAdmin = async () => {
    try {
        const DEFAULT_ADMINS = [
            {
                email: 'adminb@sistemabancario.local',
                password: 'ADMINB',
                username: 'adminb',
                name: 'ADMINB',
                surname: 'Sistema Bancario',
            },
        ];

        // Asegurar que existe el rol ADMIN
        const [adminRole] = await Role.findOrCreate({
            where: { Name: ADMIN_ROLE },
            defaults: { Name: ADMIN_ROLE },
        });

        for (const admin of DEFAULT_ADMINS) {
            let user = await User.findOne({ where: { Email: admin.email } });

            if (!user) {
                const hashed = await hashPassword(admin.password);
                user = await User.create({
                    Name: admin.name,
                    Surname: admin.surname,
                    Username: admin.username,
                    Email: admin.email,
                    Password: hashed,
                    Status: true,
                });

                await UserProfile.create({
                    UserId: user.Id,
                    Phone: '00000000',
                    ProfilePicture: '',
                });

                await UserEmail.create({
                    UserId: user.Id,
                    EmailVerified: true
                });

                await UserPasswordReset.create({
                    UserId: user.Id
                });

                await UserRole.create({
                    UserId: user.Id,
                    RoleId: adminRole.Id
                });

                console.log(`Admin creado exitosamente: ${admin.email}`);
                continue;
            }

            // Asegurar credenciales y estado activo del admin requerido por la especificacion.
            const hashed = await hashPassword(admin.password);
            await User.update(
                {
                    Name: admin.name,
                    Surname: admin.surname,
                    Username: admin.username,
                    Password: hashed,
                    Status: true
                },
                { where: { Id: user.Id } }
            );

            // Forzar rol ADMIN como rol principal/unico para los admins por defecto
            await UserRole.destroy({ where: { UserId: user.Id } });
            await UserRole.create({
                UserId: user.Id,
                RoleId: adminRole.Id
            });
            console.log(`Rol ADMIN asegurado para: ${admin.email}`);
        }
    } catch (err) {
        console.error('Error creando admin por defecto:', err);
        throw err;
    }
};

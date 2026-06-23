import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { User } from '../users/user.model.js';

export const BenefitRedemption = sequelize.define(
    'BenefitRedemption',
    {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id',
        },
        UserId: {
            type: DataTypes.STRING(16),
            allowNull: false,
            field: 'user_id',
            references: {
                model: User,
                key: 'id',
            },
        },
        BenefitId: {
            type: DataTypes.STRING(80),
            allowNull: false,
            field: 'benefit_id',
        },
        Code: {
            type: DataTypes.STRING(32),
            allowNull: false,
            field: 'code',
        },
        RedeemedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'redeemed_at',
        },
    },
    {
        tableName: 'benefit_redemptions',
        timestamps: false,
        indexes: [
            { unique: true, fields: ['user_id', 'benefit_id'] },
            { fields: ['user_id'] },
        ],
    }
);

User.hasMany(BenefitRedemption, { foreignKey: 'user_id', as: 'BenefitRedemptions' });
BenefitRedemption.belongsTo(User, { foreignKey: 'user_id', as: 'User' });


const { DataTypes } = require('sequelize');
const db = require('../Config/db');

const sequelize = db.getSequelize();

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'first_name',
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'last_name',
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
        validate: {
            len: [10, 20]
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: true, // Optionnel car Google/Facebook n'en ont pas besoin
        validate: {
            len: [8, 255]
        }
    },
    // Nouveaux champs pour l'authentification multi-provider
    authProvider: {
        type: DataTypes.ENUM('phone', 'google', 'facebook'),
        allowNull: true, // Temporairement true pour la synchronisation
        field: 'auth_provider',
        defaultValue: 'phone' // Valeur par défaut
    },
    primaryIdentifier: {
        type: DataTypes.STRING(255),
        allowNull: true, // Temporairement true pour la synchronisation
        unique: true,
        field: 'primary_identifier',
        comment: 'Phone pour phone, Email pour google, Facebook ID pour facebook'
    },
    // Champs pour les providers externes
    googleId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        field: 'google_id'
    },
    facebookId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        field: 'facebook_id'
    },
    // Champs optionnels pour Facebook (peuvent être phone ou email)
    facebookPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'facebook_phone'
    },
    facebookEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'facebook_email'
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_verified'
    },
    role: {
        type: DataTypes.ENUM('user', 'admin', 'moderator'),
        defaultValue: 'user'
    },
    profileImage: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'profile_image',
        validate: {
            isUrl: true
        }
    },
    addressId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'address_id'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        // Index essentiels seulement - MySQL limite à 64 index par table
        {
            unique: true,
            fields: ['primary_identifier'],
            name: 'unique_primary_identifier'
        },
        {
            unique: true,
            fields: ['phone'],
            name: 'unique_phone'
        },
        {
            unique: true,
            fields: ['email'],
            name: 'unique_email'
        },
        {
            fields: ['auth_provider'],
            name: 'idx_auth_provider'
        },
        {
            fields: ['role'],
            name: 'idx_role'
        }
    ],
    // Validation au niveau de l'application
    validate: {
        
        primaryIdentifierRequired() {
            if (!this.primaryIdentifier) {
                throw new Error('primaryIdentifier est requis');
            }
        }
    }
});

module.exports = { User };
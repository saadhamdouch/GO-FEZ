const { DataTypes } = require('sequelize');
const db = require('../Config/db');

const sequelize = db.getSequelize();

const POIFile = sequelize.define('POIFile', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
            isUrl: true
        },
        comment: 'URL de l\'image principale du POI'
    },
    video: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
            isUrl: true
        },
        comment: 'URL de la vidéo du POI'
    },
    virtualTour360: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'virtual_tour_360',
        validate: {
            isUrl: true
        },
        comment: 'URL de la visite virtuelle 360°'
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
    tableName: 'poi_files',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['image'],
            name: 'idx_poi_file_image'
        },
        {
            fields: ['video'],
            name: 'idx_poi_file_video'
        }
    ]
});

module.exports = { POIFile };

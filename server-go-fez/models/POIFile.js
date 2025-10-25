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
    validate: { isUrl: true },
    comment: 'URL de l\'image principale du POI'
  },
  imagePublicId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'image_public_id',
    comment: 'Public ID Cloudinary pour l\'image'
  },
  video: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: { isUrl: true },
    comment: 'URL de la vidéo du POI'
  },
  videoPublicId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'video_public_id',
    comment: 'Public ID Cloudinary pour la vidéo'
  },
  virtualTour360: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'virtual_tour_360',
    validate: { isUrl: true },
    comment: 'URL de la visite virtuelle 360°'
  },
  virtualTourPublicId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'virtual_tour_public_id',
    comment: 'Public ID Cloudinary pour la visite virtuelle'
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
    { fields: ['image'], name: 'idx_poi_file_image' },
    { fields: ['video'], name: 'idx_poi_file_video' },
    { fields: ['image_public_id'], name: 'idx_poi_file_image_public_id' },
    { fields: ['video_public_id'], name: 'idx_poi_file_video_public_id' }
  ]
});

module.exports = { POIFile };
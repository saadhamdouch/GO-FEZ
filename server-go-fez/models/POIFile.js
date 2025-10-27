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
  poiId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'poi_id',
    comment: 'ID du POI propriétaire'
  },
  fileUrl: {
    type: DataTypes.STRING(1000),
    allowNull: false,
    field: 'file_url',
    validate: { isUrl: true },
    comment: 'URL du fichier sur Cloudinary'
  },
  type: {
    type: DataTypes.ENUM('image', 'video', 'virtualtour'),
    allowNull: false,
    comment: 'Type de fichier : image, video ou virtualtour'
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
    { fields: ['poi_id'], name: 'idx_poi_file_poi' },
    { fields: ['type'], name: 'idx_poi_file_type' }
  ]
});

module.exports = { POIFile };
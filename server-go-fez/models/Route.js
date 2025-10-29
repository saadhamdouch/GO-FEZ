const { DataTypes } = require('sequelize');
const db = require('../Config/db');
const sequelize = db.getSequelize();

const Route = sequelize.define('Route', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
 circuitId: {
            type: DataTypes.UUID,
            allowNull: false,
            
        },
  userId: {
            type: DataTypes.UUID,
            allowNull: false,
            
             },
 endPoint: {
            type: DataTypes.JSON, 
            allowNull: true,
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
   },
  isCompleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
    defaultValue: DataTypes.NOW,
  },
}, 
{
  tableName: 'routes',
  timestamps: true,
  updatedAt: 'updated_at',
  createdAt: 'created_at',
});

module.exports = { Route };

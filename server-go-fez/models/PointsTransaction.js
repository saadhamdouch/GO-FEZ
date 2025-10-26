const { DataTypes } = require("sequelize");
const db = require("../Config/db");
const { GAMIFICATIONS_ENUM } = require("../constants/gamifications");
const sequelize = db.getSequelize();

const PointsTransaction = sequelize.define(
	"PointsTransaction",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.UUID,
		},
		activity: {
			type: DataTypes.ENUM(...GAMIFICATIONS_ENUM),
			allowNull: false,
		},
		points: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		descriptionAr: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		descriptionFr: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		createdAt: {
			type: DataTypes.DATE,
			field: "created_at",
			defaultValue: DataTypes.NOW,
		},
		updatedAt: {
			type: DataTypes.DATE,
			field: "updated_at",
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "points_transaction",
		timestamps: true,
		updatedAt: "updated_at",
		createdAt: "created_at",
	}
);

module.exports = { PointsTransaction };

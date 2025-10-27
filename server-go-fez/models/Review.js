const { DataTypes } = require('sequelize');
const db = require('../Config/db');

const sequelize = db.getSequelize();

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        // references: {
        //     model: 'Users', // Assurez-vous d'utiliser le nom exact de votre table User
        //     key: 'id',
        // },
    },
    targetId: {
        type: DataTypes.UUID,
        allowNull: false,
        // Note: La référence réelle est gérée par la relation polymorphique
    },
    targetType: {
        type: DataTypes.ENUM('POI', 'CIRCUIT', 'SPACE'),
        allowNull: false,
        comment: 'Type de l\'objet évalué (POI, CIRCUIT, ou SPACE)',
    },
    rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5,
        },
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'URL de l\'image d\'accompagnement',
    },
    isAccepted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indique si l\'avis a été modéré et accepté',
    },
    aiRating: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: 'Ancienne note en cas de modification',
    },
    // Le champ 'oiReport' dans votre schéma correspond probablement à un champ de rapport ou de modération.
   
    aiReport: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Rapport de modération/raison du rejet',
    },
    helpfulCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Nombre de personnes ayant trouvé l\'avis utile',
    },
}, {
    tableName: 'Reviews',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
});

module.exports = Review;
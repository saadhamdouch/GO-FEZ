const { Circuit } = require("./Circuit");
const  Review  = require("./Review");
const { CircuitPOI } = require("./CircuitPOI");
const { Theme } = require("./Theme");
const { ThemeCircuit } = require("./ThemeCircuit");
const { City } = require("./City");
const { POILocalization } = require("./POILocalization");
const { POIFile } = require("./POIFile");
const { Category } = require("./Category");
const { GamificationRule } = require("./GamificationRule");
const { POI } = require("./POI");
const  PointsTransaction  = require("./PointsTransaction");
const  {User}  = require("./User");
const  {UserSpace}  = require("./UserSpace");
const { TransportMode } = require("./TransportMode");

// Création d’un objet contenant tous les modèles
const models = {
	POI,
	Circuit,
	CircuitPOI,
	Theme,
	ThemeCircuit,
	City,
	POILocalization,
	POIFile,
	Category,
	GamificationRule,
	Review,
	PointsTransaction,
	User,
	UserSpace,
	TransportMode
};

// Appel automatique de toutes les associations si elles existent
Object.values(models).forEach((model) => {
	if (model.associate) model.associate(models);
});

//  Associations Circuit ↔ POI via CircuitPOI
Circuit.belongsToMany(POI, {
	through: CircuitPOI,
	foreignKey: "circuitId",
	otherKey: "poiId",
	as: "pois",
});
POI.belongsToMany(Circuit, {
	through: CircuitPOI,
	foreignKey: "poiId",
	otherKey: "circuitId",
	as: "circuits",
});

//  Associations Circuit ↔ Theme via ThemeCircuit
Circuit.belongsToMany(Theme, {
	through: ThemeCircuit,
	foreignKey: "circuitId",
	otherKey: "themeId",
	as: "themes",
});
Theme.belongsToMany(Circuit, {
	through: ThemeCircuit,
	foreignKey: "themeId",
	otherKey: "circuitId",
	as: "circuitsFromThemes",
});

Category.hasMany(POI, {
  foreignKey: 'category',
  as: 'pois',
});

POI.belongsTo(Category, {
  foreignKey: 'category',
  as: 'categoryPOI',
});

//  Associations POI ↔ POILocalization
POI.belongsTo(POILocalization, {
	as: "arLocalization",
	foreignKey: "ar",
	targetKey: "id",
});
POI.belongsTo(POILocalization, {
	as: "frLocalization",
	foreignKey: "fr",
	targetKey: "id",
});
POI.belongsTo(POILocalization, {
	as: "enLocalization",
	foreignKey: "en",
	targetKey: "id",
});

POILocalization.hasMany(POI, {
	as: "arPOIs",
	foreignKey: "ar",
	sourceKey: "id",
});
POILocalization.hasMany(POI, {
	as: "frPOIs",
	foreignKey: "fr",
	sourceKey: "id",
});
POILocalization.hasMany(POI, {
	as: "enPOIs",
	foreignKey: "en",
	sourceKey: "id",
});

//  Associations POI ↔ POIFile
POI.belongsTo(POIFile, {
	as: "poiFile",
	foreignKey: "poiFileId",
	targetKey: "id",
});
POIFile.hasMany(POI, { as: "pois", foreignKey: "poiFileId", sourceKey: "id" });

// Associations POI ↔ City
POI.belongsTo(City, {
    as: "city",
    foreignKey: "cityId", 
    targetKey: "id",      
});

City.hasMany(POI, {
    as: "pois",
    foreignKey: "cityId",
});


//Associations PointsTransaction ↔ User (1.*)
User.hasMany(PointsTransaction, {
    foreignKey: "userId",
    as: "pointsTransactions",
});
PointsTransaction.belongsTo(User, {
    foreignKey: "userId",
    as: "users",
});

// Associations PointsTransaction ↔ GamificationRule (1.1)
PointsTransaction.belongsTo(GamificationRule, {
    foreignKey: "gamificationRuleId",
    as: "rule",
});
GamificationRule.hasMany(PointsTransaction, {
    foreignKey: "gamificationRuleId",
    as: "pointsTransactions",
});
Circuit.hasMany(Review, {
    foreignKey: 'targetId',
    scope: {
        targetType: 'CIRCUIT'
    },
    as: 'reviews'
});

Review.belongsTo(Circuit, {
    foreignKey: 'targetId',
    constraints: false 
});

POI.hasMany(Review, { 
    foreignKey: 'poiId', 
    as: 'reviews' 
});
POI.belongsTo(User, {
    foreignKey: 'ownerId',
    as: 'ownerInfo' 
});

POI.hasOne(UserSpace, { foreignKey: 'poi_id', as: 'spaceDetails' }); 
UserSpace.belongsTo(POI, { foreignKey: 'poi_id' });

UserSpace.belongsTo(User, { foreignKey: 'user_id', as: 'spaceOwner' }); 
User.hasMany(UserSpace, { foreignKey: 'user_id' });

module.exports = models;

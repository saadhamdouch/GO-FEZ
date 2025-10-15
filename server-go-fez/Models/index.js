const { POI } = require('./POI');
const { Circuit } = require('./Circuit');
const { CircuitPOI } = require('./CircuitPOI');
const { Theme } = require('./Theme');
const { ThemeCircuit } = require('./ThemeCircuit');
const { City } = require('./City');
const { POILocalization } = require('./POILocalization');
const { POIFile } = require('./POIFile');
const {Category} = require('./Category');


// Création d’un objet contenant tous les modèles
const models = { POI, Circuit, CircuitPOI, Theme, ThemeCircuit, City, POILocalization, POIFile, Category };

// Appel automatique de toutes les associations si elles existent
Object.values(models).forEach(model => {
    if (model.associate) model.associate(models);
});

//  Associations Circuit ↔ POI via CircuitPOI
Circuit.belongsToMany(POI, {
    through: CircuitPOI,
    foreignKey: 'circuitId',
    otherKey: 'poiId',
    as: 'pois'
});
POI.belongsToMany(Circuit, {
    through: CircuitPOI,
    foreignKey: 'poiId',
    otherKey: 'circuitId',
    as: 'circuits'
});

//  Associations Circuit ↔ Theme via ThemeCircuit
Circuit.belongsToMany(Theme, {
    through: ThemeCircuit,
    foreignKey: 'circuitId',
    otherKey: 'themeId',
    as: 'themes'
});
Theme.belongsToMany(Circuit, {
    through: ThemeCircuit,
    foreignKey: 'themeId',
    otherKey: 'circuitId',
    as: 'circuitsFromThemes'
});


// Category.hasMany(POI, {
//   foreignKey: 'categoryId',
//   as: 'pois',
// });

// POI.belongsTo(Category, {
//   foreignKey: 'categoryId',
//   as: 'category',
// });

//  Associations POI ↔ POILocalization
POI.belongsTo(POILocalization, { as: 'arLocalization', foreignKey: 'ar', targetKey: 'id' });
POI.belongsTo(POILocalization, { as: 'frLocalization', foreignKey: 'fr', targetKey: 'id' });
POI.belongsTo(POILocalization, { as: 'enLocalization', foreignKey: 'en', targetKey: 'id' });

POILocalization.hasMany(POI, { as: 'arPOIs', foreignKey: 'ar', sourceKey: 'id' });
POILocalization.hasMany(POI, { as: 'frPOIs', foreignKey: 'fr', sourceKey: 'id' });
POILocalization.hasMany(POI, { as: 'enPOIs', foreignKey: 'en', sourceKey: 'id' });

//  Associations POI ↔ POIFile
POI.belongsTo(POIFile, { as: 'poiFile', foreignKey: 'poiFileId', targetKey: 'id' });
POIFile.hasMany(POI, { as: 'pois', foreignKey: 'poiFileId', sourceKey: 'id' });

module.exports = models;

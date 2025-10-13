const { POI } = require('./POI');
const { POILocalization } = require('./POILocalization');
const { POIFile } = require('./POIFile');

// Relations POI avec POILocalization
POI.belongsTo(POILocalization, {
    as: 'arLocalization',
    foreignKey: 'ar',
    targetKey: 'id'
});

POI.belongsTo(POILocalization, {
    as: 'frLocalization',
    foreignKey: 'fr',
    targetKey: 'id'
});

POI.belongsTo(POILocalization, {
    as: 'enLocalization',
    foreignKey: 'en',
    targetKey: 'id'
});

// Relations inverses POILocalization avec POI
POILocalization.hasMany(POI, {
    as: 'arPOIs',
    foreignKey: 'ar',
    sourceKey: 'id'
});

POILocalization.hasMany(POI, {
    as: 'frPOIs',
    foreignKey: 'fr',
    sourceKey: 'id'
});

POILocalization.hasMany(POI, {
    as: 'enPOIs',
    foreignKey: 'en',
    sourceKey: 'id'
});

// Relation POI avec POIFile
POI.belongsTo(POIFile, {
    as: 'poiFile',
    foreignKey: 'poiFileId',
    targetKey: 'id'
});

// Relation inverse POIFile avec POI
POIFile.hasMany(POI, {
    as: 'pois',
    foreignKey: 'poiFileId',
    sourceKey: 'id'
});

module.exports = {
    POI,
    POILocalization,
    POIFile
};

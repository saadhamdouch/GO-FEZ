const { 
    Route, 
    Circuit, 
    POI, 
    VisitedTrace, 
    RemovedTrace,
    City,
    Theme,
    POILocalization, 
} = require('../models');

const { Op } = require('sequelize');
const Sequelize = require('sequelize'); 

// ====================================================================
// 1. Démarrer une nouvelle Route (POST /routes/start)
// ====================================================================
exports.startRoute = async (req, res) => {
    // 1. Extraction des données. On suppose que userId vient du token d'authentification.
    const { circuitId, longitude, latitude, pois } = req.body;
    const userId = req.user.userId; 

    if (!circuitId || !latitude || !longitude) {
        return res.status(400).json({ 
            status: 'fail', 
            message: 'circuitId, longitude, latitude sont requis.' 
        });
    }

    try {
        
        // 1.2 Vérification de l'existence du Circuit original
        const circuit = await Circuit.findOne({
              where: { id: circuitId , isDeleted: false },
              include: [
                {
                  model: City,
                  as: 'city'
                },
                {
                  model: Theme,
                  as: 'themes',
                  through: { attributes: [] },
                  where: { isDeleted: false },
                  required: false
                },
                {
                  model: POI,
                  as: 'pois',
                  through: {
                    attributes: ['order', 'estimatedTime']
                  },
                  where: { isDeleted: false },
                  required: false,
                  include: [
                    { model: POILocalization, as: 'frLocalization' },
                    { model: POILocalization, as: 'arLocalization' },
                    { model: POILocalization, as: 'enLocalization' }
                  ]
                }
              ]
            });

        if (!circuit) {
            return res.status(404).json({ 
                status: 'fail', 
                message: 'Le Circuit original est introuvable.' 
            });
        }

        let idOfPoi = (pois && pois.length > 0) ? pois[0] : null;

        // 1.3 Création du nouvel enregistrement Route
        const newRoute = await Route.create({
            userId: req.user.userId,
            circuitId,
            isCompleted: false,
            endPoint: circuit.endPoint
        });

        // 1.4 Création de la première trace (obligatoire)
        const newVisitedTrace = await VisitedTrace.create({
            routeId: newRoute.id,
            latitude,
            longitude,
            idPoi: idOfPoi 
        });
        
        return res.status(201).json({
            status: 'success',
            message: 'Route démarrée avec succès. Première trace enregistrée.',
            data: { 
                circuit, 
                firstTrace: newVisitedTrace,
                isRouteCompleted: false
            }
        });

    } catch (error) {
        console.error('Erreur au démarrage de la Route:', error);
        return res.status(500).json({ 
            status: 'error', 
            message: 'Erreur interne du serveur.' 
        });
    }
};

// ====================================================================
// 2. Enregistrer la trace GPS et/ou la visite de POI (POST /routes/trace)
// ====================================================================
exports.addVisitedTrace = async (req, res) => {
    const { routeId, longitude, latitude, pois } = req.body;
    const userId = req.user.userId; 

    if (!routeId || !longitude || !latitude) {
        return res.status(400).json({ 
            status: 'fail', 
            message: 'routeId, longitude et latitude sont requis.' 
        });
    }

    try {
        // 1. Vérification de la Route
        const route = await Route.findOne({
            where: { id: routeId, userId: userId, isCompleted: false }
        });
        
        if (!route) {
            return res.status(404).json({ 
                status: 'fail', 
                message: 'Route introuvable ou déjà complétée/annulée.' 
            });
        }

        let idOfPoi = (pois && pois.length > 0) ? pois[0] : null;

        // 2. Création de l'enregistrement VisitedTrace
        const newTrace = await VisitedTrace.create({
            routeId,
            longitude,
            latitude,
            idPoi: idOfPoi
        });
        
        // =========================================================
        // 3. LOGIQUE DE VÉRIFICATION D'AUTO-COMPLÉTION (FINAL)
        // =========================================================
        let isRouteCompleted = false;

        // N'exécuter la logique de vérification complète que si un POI a été signalé
        if (idOfPoi) {
            
            // A. Obtenir tous les POIs originaux du Circuit
            const circuitWithPois = await Circuit.findByPk(route.circuitId, {
                include: [{
                    model: POI,
                    as: 'pois', // Assurez-vous que cette association est définie dans Circuit.js
                    attributes: ['id'],
                    through: { attributes: [] }
                }]
            });
            
            if (!circuitWithPois) {
                return res.status(404).json({ status: 'fail', message: 'Circuit non trouvé.' });
            }

            const allOriginalPoiIds = circuitWithPois.pois.map(p => p.id);
            
            // B. Identifier les POIs retirés
            const removedTraces = await RemovedTrace.findAll({
                where: { userId: userId, circuitId: route.circuitId },
                attributes: ['poiId']
            });
            const removedPoiIds = removedTraces.map(t => t.poiId);

            // C. Déterminer les POIs REQUIs (Originals - Removed)
            const requiredPoiIds = allOriginalPoiIds.filter(id => 
                !removedPoiIds.includes(id)
            );

            // D. Déterminer les POIs VISITÉS (Uniques)
            const visitedPoisRecords = await VisitedTrace.findAll({
                where: { routeId: route.id, idPoi: { [Op.ne]: null } },
                // Utiliser DISTINCT pour ne compter qu'une seule visite par POI
                attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('idPoi')), 'poiId']] 
            });
            // Convertir le résultat en un tableau simple d'IDs
            const visitedPoiIds = visitedPoisRecords.map(p => p.dataValues.poiId);
            
            // E. Comparaison Finale: Le nombre de POIs visités correspond-il aux POIs requis?
            if (requiredPoiIds.length > 0 && requiredPoiIds.length === visitedPoiIds.length) {
                // Vérifier qu'AUCUN POI requis n'a été manqué
                const allRequiredVisited = requiredPoiIds.every(id => visitedPoiIds.includes(id));
                
                if (allRequiredVisited) {
                    isRouteCompleted = true;
                }
            }
        }
        
        // 4. Mise à jour de la Route si complétée
        if (isRouteCompleted) {
            await Route.update(
                { isCompleted: true },
                { where: { id: route.id } } 
            );
        }

        // 5. Préparation de la réponse (Récupérer toutes les traces pour le contexte du front-end)
        const visitedTraces = await VisitedTrace.findAll({ where: { routeId: route.id } });

        return res.status(201).json({
            status: 'success',
            message: 'Trace enregistrée avec succès.',
            data: {
                newTrace: newTrace, 
                visitedTraces: visitedTraces,
                isRouteCompleted: isRouteCompleted
            }
        });

    } catch (error) {
        console.error('Erreur lors de l\'ajout de la trace:', error);
        return res.status(500).json({ status: 'error', message: 'Erreur interne du serveur.' });
    }
};


// ====================================================================
// 5. Retirer un POI du Circuit (POST /routes/remove-poi)
// ====================================================================
exports.removePOIFromRoute = async (req, res) => {
    const { circuitId, poiId } = req.body;
    const userId = req.user.userId; 

    if (!circuitId || !poiId ) {
        return res.status(400).json({ status: 'fail', message: 'circuitId, poiId sont requis.' });
    }

    try {
        // Création de l'enregistrement dans RemovedTrace (gestion implicite du doublon par la base)
        const newRemovedTrace = await RemovedTrace.create({
            circuitId,
            poiId,
            userId
        });

        return res.status(201).json({
            status: 'success',
            message: 'POI marqué comme retiré.',
            data: newRemovedTrace
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ status: 'fail', message: 'Ce POI est déjà marqué comme retiré.' });
        }
        console.error('Erreur lors du retrait du POI:', error);
        return res.status(500).json({ status: 'error', message: 'Erreur interne du serveur.' });
    }
};

// ====================================================================
// 6. Annuler le retrait d'un POI (DELETE /routes/remove-poi)
// ====================================================================
exports.unremovePOIFromRoute = async (req, res) => {
    const { circuitId, poiId } = req.body;
    const userId = req.user.id; 

    if (!circuitId || !poiId || !userId) {
        return res.status(400).json({
            status: 'fail',
            message: 'Les IDs du circuit, du POI et de l\'utilisateur sont requis.'
        });
    }

    try {
        // Suppression de l'enregistrement RemovedTrace correspondant
        const deletedRows = await RemovedTrace.destroy({
            where: {
                circuitId: circuitId,
                poiId: poiId,
                userId: userId
            }
        });

        if (deletedRows === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'Ce POI n\'était pas marqué comme retiré.'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Le POI a été restauré dans l\'itinéraire.'
        });

    } catch (error) {
        console.error('Erreur lors de l\'annulation de la suppression du POI:', error);
        return res.status(500).json({ status: 'error', message: 'Erreur interne du serveur.' });
    }
};

// ====================================================================
// 7. Obtenir la liste des POIs retirés (GET /routes/removed-pois)
// ====================================================================
exports.getRemovedPOIs = async (req, res) => {
    // Les IDs sont extraits des query parameters pour une requête GET
    const { circuitId } = req.query;
    const userId = req.user.userId; 

    if (!circuitId ) {
        return res.status(400).json({
            status: 'fail',
            message: 'circuitId  est requis dans les paramètres de requête.'
        });
    }

    try {
        const removedTraces = await RemovedTrace.findAll({
            where: {
                circuitId: circuitId,
                userId: userId
            },
            attributes: ['poiId'] 
        });

        const removedPoiIds = removedTraces.map(trace => trace.poiId);

        return res.status(200).json({
            status: 'success',
            message: 'Liste des POIs retirés récupérée avec succès.',
            data: removedPoiIds
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des POIs retirés:', error);
        return res.status(500).json({ status: 'error', message: 'Erreur interne du serveur.' });
    }
};
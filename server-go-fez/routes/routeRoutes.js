const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { authenticateToken }= require('../middleware/authEnhanced')

// POST /api/routes/start
router.post('/start', authenticateToken, routeController.startRoute);

// 2. Enregistrer une trace GPS et/ou une visite de POI
// POST /api/routes/trace
router.post('/trace', authenticateToken, routeController.addVisitedTrace);


// 5. Retirer un POI du circuit (Personnalisation)
// POST /api/routes/remove-poi
router.post('/remove-poi', authenticateToken, routeController.removePOIFromRoute);

// 6. Annuler le retrait d'un POI (Restaurer le POI)
// DELETE /api/routes/remove-poi
router.delete('/remove-poi', authenticateToken, routeController.unremovePOIFromRoute);

// 7. Obtenir la liste des POIs retirés par l'utilisateur (pour le filtrage Frontend)
// GET /api/routes/removed-pois?circuitId=123&userId=456
router.get('/removed-pois', authenticateToken, routeController.getRemovedPOIs);


module.exports = router;
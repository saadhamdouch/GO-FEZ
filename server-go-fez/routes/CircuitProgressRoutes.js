// server-go-fez/routes/CircuitProgressRoutes.js
const express = require('express');
const router = express.Router();
const progressController = require('../controllers/CircuitProgressController');

// Import authentication middleware
const { authenticateToken } = require('../middleware/authEnhanced');

// Apply authentication to ALL routes
router.use(authenticateToken);
// Routes
router.post('/start', progressController.startCircuit);
router.post('/update', progressController.updateCircuitProgress);
router.get('/user', progressController.getAllUserProgress);
router.get('/:circuitId', progressController.getCircuitProgress);

module.exports = router;
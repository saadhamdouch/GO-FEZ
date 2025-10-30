// server-go-fez/routes/CustomCircuitRoutes.js

const express = require('express');
const router = express.Router();
const customCircuitController = require('../controllers/CustomCircuitController');

// Importer le middleware d'authentification
const { authenticate } = require('../middleware/authEnhanced');

// Toutes les routes pour les circuits personnalisés nécessitent une authentification


/**
 * @route   POST /api/custom-circuits
 * @desc    Créer un nouveau circuit personnalisé
 * @access  Privé
 * @body    { name, selectedPOIs, startDate?, estimatedDuration?, isPublic? }
 */
router.post('/', customCircuitController.createCustomCircuit);

/**
 * @route   GET /api/custom-circuits/user
 * @desc    Récupérer tous les circuits personnalisés de l'utilisateur connecté
 * @access  Privé
 */
router.get('/user', customCircuitController.getUserCustomCircuits);

/**
 * @route   GET /api/custom-circuits/:id
 * @desc    Récupérer un circuit personnalisé par ID (propriétaire ou public)
 * @access  Privé
 * @params  id
 */
router.get('/:id', customCircuitController.getCustomCircuitById);

/**
 * @route   PUT /api/custom-circuits/:id
 * @desc    Mettre à jour un circuit personnalisé (propriétaire uniquement)
 * @access  Privé
 * @params  id
 * @body    { name?, selectedPOIs?, startDate?, estimatedDuration?, isPublic? }
 */
router.put('/:id', customCircuitController.updateCustomCircuit);

/**
 * @route   DELETE /api/custom-circuits/:id
 * @desc    Supprimer (logiquement) un circuit personnalisé (propriétaire uniquement)
 * @access  Privé
 * @params  id
 */
router.delete('/:id', customCircuitController.deleteCustomCircuit);

module.exports = router;
// server-go-fez/routes/StatisticsRoutes.js

const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/StatisticsController');

// Importer middlewares
const { authenticate, isAdmin } = require('../middleware/authEnhanced');

// Toutes les routes statistiques sont réservées aux admins

/**
 * @route   GET /api/stats/overview
 * @desc    Récupérer les statistiques d'aperçu
 * @access  Admin
 */
router.get('/overview', statisticsController.getOverviewStats);

/**
 * @route   GET /api/stats/user-growth
 * @desc    Récupérer la croissance des utilisateurs (nouvelles inscriptions)
 * @access  Admin
 * @query   days? (défaut 7)
 */
router.get('/user-growth', statisticsController.getUserGrowth); // NOUVEAU

/**
 * @route   GET /api/stats/popular-pois
 * @desc    Récupérer les POIs les plus populaires par nombre d'avis
 * @access  Admin
 * @query   limit? (défaut 5)
 */
router.get('/popular-pois', statisticsController.getPopularPois); // NOUVEAU

module.exports = router;
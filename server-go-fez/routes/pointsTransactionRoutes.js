const express = require('express');
const { createPointsTransaction, findUserTransactions } = require('../controllers/PointsTransactionController');

const router = express.Router();

// Route pour créer une nouvelle transaction de points
// POST /api/v1/transactions/
router.post('/', createPointsTransaction);

// Route pour récupérer toutes les transactions d'un utilisateur
// GET /api/v1/transactions/user/:userId
router.get('/user/:userId', findUserTransactions);

module.exports = router;
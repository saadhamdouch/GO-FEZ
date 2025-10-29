// server-go-fez/routes/ReviewRoutes.js

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/ReviewController');

// Importer le middleware d'authentification et l'upload
// J'assume que 'authenticate' est votre middleware JWT et 'upload' est multer
const { authenticate, upload } = require('../middleware/authEnhanced');

/**
 * @route   POST /api/reviews
 * @desc    Créer un nouvel avis
 * @access  Privé (Utilisateur connecté)
 * @body    { poiId, rating, comment }
 * @files   photos (optionnel, max 5)
 */
router.post(
	'/',
	authenticate, // Protège la route
	upload.array('photos', 5), // Gère l'upload de max 5 photos
	reviewController.createReview
);

/**
 * @route   GET /api/reviews/poi/:poiId
 * @desc    Récupérer les avis pour un POI (avec pagination)
 * @access  Public
 * @params  poiId
 * @query   page, limit
 */
router.get('/poi/:poiId', reviewController.getReviewsForPOI);

/**
 * @route   DELETE /api/reviews/:reviewId
 * @desc    Supprimer un avis (par le propriétaire ou un admin)
 * @access  Privé (Propriétaire ou Admin)
 * @params  reviewId
 */
router.delete(
	'/:reviewId',
	authenticate, // Protège la route
	reviewController.deleteReview
);

module.exports = router;
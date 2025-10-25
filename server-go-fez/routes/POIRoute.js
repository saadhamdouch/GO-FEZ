const express = require('express');
const { body } = require('express-validator');
const {
  handleValidationErrors,
  createPOIWithFiles,
  findAllPOIs,
  findOnePOI,
  updatePOI,
  deletePOI
} = require('../controllers/POIController.js');

// Middleware personnalisé pour gérer les uploads multiples
const uploadMultipleFiles = (req, res, next) => {
  const multer = require('multer');
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
  });

  const fields = [
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'virtualTour360', maxCount: 1 },
    { name: 'fr_audio', maxCount: 1 },
    { name: 'ar_audio', maxCount: 1 },
    { name: 'en_audio', maxCount: 1 }
  ];

  upload.fields(fields)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: 'Erreur lors de l\'upload des fichiers',
        error: err.message
      });
    }
    next();
  });
};

const POIRouter = express.Router();

// Route pour récupérer tous les POIs
POIRouter.get('/', findAllPOIs);

// Route pour récupérer un POI par ID
POIRouter.get('/:id', findOnePOI);

// Route pour créer un POI avec upload de fichiers
POIRouter.post(
  '/create-with-files',
  uploadMultipleFiles,
  [
    body('coordinates')
      .isString()
      .withMessage('Les coordonnées doivent être une chaîne JSON valide'),
    body('category')
      .isUUID()
      .withMessage('La catégorie doit être un UUID valide'),
    body('cityId')
      .isUUID()
      .withMessage('L\'ID de la ville doit être un UUID valide'),
    body('practicalInfo')
      .optional()
      .isString()
      .withMessage('Les informations pratiques doivent être une chaîne JSON valide'),
    body('arLocalization')
      .optional()
      .isString()
      .withMessage('La localisation arabe doit être une chaîne JSON valide'),
    body('frLocalization')
      .optional()
      .isString()
      .withMessage('La localisation française doit être une chaîne JSON valide'),
    body('enLocalization')
      .optional()
      .isString()
      .withMessage('La localisation anglaise doit être une chaîne JSON valide'),
    handleValidationErrors
  ],
  createPOIWithFiles
);

// Route pour mettre à jour un POI
POIRouter.put(
  '/:id',
  uploadMultipleFiles,
  [
    body('coordinates')
      .optional()
      .isString()
      .withMessage('Les coordonnées doivent être une chaîne JSON valide'),
    body('category')
      .optional()
      .isUUID()
      .withMessage('La catégorie doit être un UUID valide'),
    body('cityId')
      .optional()
      .isUUID()
      .withMessage('L\'ID de la ville doit être un UUID valide'),
    body('practicalInfo')
      .optional()
      .isString()
      .withMessage('Les informations pratiques doivent être une chaîne JSON valide'),
    handleValidationErrors
  ],
  updatePOI
);

// Route pour supprimer un POI (suppression logique)
POIRouter.delete('/:id', deletePOI);

module.exports = { POIRouter };
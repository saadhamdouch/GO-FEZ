const express = require('express');
const { body } = require('express-validator');
const { 
    handleValidationErrors,
    createPOI,
    createPOIWithFiles,
    findAllPOIs,
    findOnePOI,
    updatePOI,
    deletePOI
} = require('../controllers/POIController.js');
const { 
    uploadImage, 
    uploadAudio, 
    uploadVideo, 
    uploadVirtualTour 
} = require('../Config/cloudinary.js');

// Middleware personnalisé pour gérer les uploads multiples
const uploadMultipleFiles = (req, res, next) => {
    const multer = require('multer');
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 100 * 1024 * 1024 // 100MB max
        }
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

// Routes d'upload Cloudinary
POIRouter.post('/upload/image', uploadImage.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier image fourni'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Image uploadée avec succès',
            imageUrl: req.file.path,
            publicId: req.file.filename
        });
    } catch (error) {
        console.error('Erreur lors de l\'upload de l\'image:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'upload de l\'image'
        });
    }
});

POIRouter.post('/upload/audio', uploadAudio.single('audio'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier audio fourni'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Audio uploadé avec succès',
            audioUrl: req.file.path,
            publicId: req.file.filename
        });
    } catch (error) {
        console.error('Erreur lors de l\'upload de l\'audio:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'upload de l\'audio'
        });
    }
});

POIRouter.post('/upload/video', uploadVideo.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier vidéo fourni'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vidéo uploadée avec succès',
            videoUrl: req.file.path,
            publicId: req.file.filename
        });
    } catch (error) {
        console.error('Erreur lors de l\'upload de la vidéo:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'upload de la vidéo'
        });
    }
});

POIRouter.post('/upload/virtual-tour', uploadVirtualTour.single('virtualTour'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier de visite virtuelle fourni'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Visite virtuelle uploadée avec succès',
            virtualTourUrl: req.file.path,
            publicId: req.file.filename
        });
    } catch (error) {
        console.error('Erreur lors de l\'upload de la visite virtuelle:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'upload de la visite virtuelle'
        });
    }
});

// Routes principales des POI
POIRouter.get('/', findAllPOIs);

// Route pour créer un POI avec upload de fichiers
POIRouter.post('/create-with-files', 
    uploadMultipleFiles,
    [
        body('coordinates')
            .isString()
            .withMessage('Les coordonnées doivent être une chaîne JSON valide'),
        body('category')
            .isInt({ min: 1 })
            .withMessage('La catégorie doit être un nombre entier positif'),
        body('cityId')
            .isUUID()
            .withMessage('L\'ID de la ville doit être un UUID valide'),
        body('practicalInfo')
            .optional()
            .isString()
            .withMessage('Les informations pratiques doivent être une chaîne JSON valide'),
        body('arLocalization')
            .isString()
            .withMessage('La localisation arabe doit être une chaîne JSON valide'),
        body('frLocalization')
            .isString()
            .withMessage('La localisation française doit être une chaîne JSON valide'),
        body('enLocalization')
            .isString()
            .withMessage('La localisation anglaise doit être une chaîne JSON valide'),
        handleValidationErrors
    ], 
    createPOIWithFiles
);

POIRouter.post('/create', [
    body('coordinates')
        .isObject()
        .withMessage('Les coordonnées doivent être un objet'),
    body('category')
        .isInt({ min: 1 })
        .withMessage('La catégorie doit être un nombre entier positif'),
    body('cityId')
        .isUUID()
        .withMessage('L\'ID de la ville doit être un UUID valide'),
    body('practicalInfo')
        .optional()
        .isObject()
        .withMessage('Les informations pratiques doivent être un objet'),
    body('arLocalization')
        .optional()
        .isObject()
        .withMessage('La localisation arabe doit être un objet'),
    body('frLocalization')
        .optional()
        .isObject()
        .withMessage('La localisation française doit être un objet'),
    body('enLocalization')
        .optional()
        .isObject()
        .withMessage('La localisation anglaise doit être un objet'),
    handleValidationErrors
], createPOI);

POIRouter.get('/:id', findOnePOI);

POIRouter.put('/:id', [
    body('coordinates')
        .optional()
        .isObject()
        .withMessage('Les coordonnées doivent être un objet'),
    body('category')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La catégorie doit être un nombre entier positif'),
    body('practicalInfo')
        .optional()
        .isObject()
        .withMessage('Les informations pratiques doivent être un objet'),
    handleValidationErrors
], updatePOI);

POIRouter.delete('/:id', deletePOI);

module.exports = { POIRouter };

const express = require('express');
const router = express.Router();
const circuitController = require('../controllers/circuitController');
const { uploadImage, uploadCircuitImage } = require("../config/cloudinary");

// Route pour créer un circuit avec upload d'image
router.post('/create-with-image', uploadCircuitImage.single('image'), circuitController.createCircuitWithImage);


router.get('/', circuitController.getAllCircuits);
router.get('/:id', circuitController.getCircuitById);
router.put('/:id/update-with-image', uploadCircuitImage.single('image'), circuitController.updateCircuit);
router.delete('/:id', circuitController.deleteCircuit);

module.exports = router;

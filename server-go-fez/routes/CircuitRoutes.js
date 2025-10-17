const express = require('express');
const router = express.Router();
const circuitController = require('../controllers/circuitController');
const { uploadImage, uploadCircuitImage } = require("../Config/cloudinary");

// Route pour créer un circuit avec upload d'image
router.post('/create-with-image', uploadCircuitImage.single('image'), circuitController.createCircuitWithImage);
router.post('/', circuitController.createCircuitWithRelations);


router.get('/', circuitController.getAllCircuits);
router.get('/:id', circuitController.getCircuitById);
router.put('/:id', circuitController.updateCircuit);
router.delete('/:id', circuitController.deleteCircuit);

module.exports = router;

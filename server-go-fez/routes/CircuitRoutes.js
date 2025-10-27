const express = require('express');
const router = express.Router();
const circuitController = require('../controllers/circuitController');
const { uploadCircuitImage } = require("../Config/cloudinary");

// Routes principales des circuits
router.post('/create-with-image', uploadCircuitImage.single('image'), circuitController.createCircuitWithImage);
router.get('/', circuitController.getAllCircuits);
router.get('/:id', circuitController.getCircuitById);
router.put('/:id/update-with-image', uploadCircuitImage.single('image'), circuitController.updateCircuit);
router.delete('/:id', circuitController.deleteCircuit);

// Routes pour gérer les POIs dans un circuit
router.post('/pois', circuitController.addPOIToCircuit);
router.delete('/:circuitId/pois/:poiId', circuitController.removePOIFromCircuit);

module.exports = router;
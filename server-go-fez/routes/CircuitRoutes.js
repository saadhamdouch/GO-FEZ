const express = require('express');
const router = express.Router();
const circuitController = require('../controllers/circuitController');

router.post('/', circuitController.createCircuitWithRelations);
router.get('/', circuitController.getAllCircuits);
router.get('/:id', circuitController.getCircuitById);
router.put('/:id', circuitController.updateCircuit);
router.delete('/:id', circuitController.deleteCircuit);

module.exports = router;

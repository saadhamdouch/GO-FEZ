const express = require('express');
const { body } = require('express-validator');
const multer = require("multer");
const path = require('path');
const router = express.Router();
const CityController = require('../controllers/CityController');

// middleware/auth.js 
// const authenticateJWT = (req, res, next) => {
//     next(); 
// };

router.post('/', CityController.createCity);

router.get('/', CityController.getAllCities);

router.put('/:id', CityController.updateCity);

module.exports = router;
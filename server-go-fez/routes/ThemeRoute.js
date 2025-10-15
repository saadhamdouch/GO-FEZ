const express = require('express');
const router = express.Router();
const ThemeController = require('../controllers/ThemeController');

router.post('/', ThemeController.createTheme);
router.get('/', ThemeController.getAllThemes);
router.get('/:id', ThemeController.getThemeById);
router.put('/:id', ThemeController.updateTheme);
router.delete('/:id', ThemeController.deleteTheme);

module.exports = router;

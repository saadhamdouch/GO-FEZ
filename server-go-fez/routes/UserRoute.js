const express = require('express');
const { body } = require('express-validator');
const multer = require("multer");
const path = require('path');
const { 
    verifyOtp,
    sendOtp,
    handleValidationErrors,
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    findAllUsers,
    findOneUser,
    updatePassword
} = require('../controllers/UserController.js');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Uploads/users/") // Assurez-vous que ce dossier existe
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "user-" + uniqueSuffix + path.extname(file.originalname))
  },
})

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Seules les images sont autorisées!"), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite à 5MB
  },
})

const UserRouter = express.Router();

// Routes
UserRouter.get('/', findAllUsers);
UserRouter.post('/register', [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Le prénom doit contenir entre 2 et 100 caractères'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Email invalide'),
    body('phone')
        .optional()
        .isMobilePhone('fr-FR')
        .withMessage('Numéro de téléphone invalide'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
    handleValidationErrors
], registerUser);
UserRouter.post(
  '/otp/verify',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('otpCode').isLength({ min: 6, max: 6 }).withMessage('Code OTP invalide'),
    handleValidationErrors,
  ],
  verifyOtp
);
UserRouter.post('/login', [
    body('identifier')
        .notEmpty()
        .withMessage('Email ou numéro de téléphone requis'),
    body('password')
        .notEmpty()
        .withMessage('Mot de passe requis'),
    handleValidationErrors
], loginUser);
UserRouter.post('/otp/send', [
  body('email').isEmail().withMessage('Email invalide'),
  handleValidationErrors,
], sendOtp);
UserRouter.get('/profile', getUserProfile);
UserRouter.put('/profile', upload.single("profileImage"), updateUserProfile);
UserRouter.get('/:id', findOneUser);
UserRouter.put('/update-password/:id', updatePassword);

module.exports = { UserRouter };

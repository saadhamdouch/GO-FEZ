const express = require('express');
const { body } = require('express-validator');
const multer = require("multer");
const path = require('path');
const { 
   registerWithProvider,
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
UserRouter.post(
  "/register",
  [
    body("firstName").trim().isLength({ min: 2, max: 100 }).withMessage("Le prénom est requis"),
    body("lastName").trim().isLength({ min: 2, max: 100 }).withMessage("Le nom est requis"),
    body("email").optional().isEmail().withMessage("Email invalide"),
    body("phone").optional().isMobilePhone("fr-FR").withMessage("Téléphone invalide"),
    body("password").isLength({ min: 8 }).withMessage("Mot de passe trop court"),
    handleValidationErrors,
  ],
  registerUser
);


UserRouter.post("/login", loginUser);
UserRouter.post("/provider-register", registerWithProvider);
UserRouter.get('/profile', getUserProfile);
UserRouter.put('/profile', upload.single("profileImage"), updateUserProfile);
UserRouter.get('/:id', findOneUser);
UserRouter.put('/update-password/:id', updatePassword);

module.exports = UserRouter;


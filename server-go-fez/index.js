const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();

const db = require("./Config/db.js"); // Importer l'instance Singleton de la base de données
const { UserRouter } = require("./routes/UserRoute.js"); // Importer les routes utilisateur

const app = express();
const { header } = require("express-validator");
const rateLimit = require('express-rate-limit');

// Charger les variables sensibles depuis le fichier .env
const PORT = process.env.PORT || 8080;

// Middlewares globaux
app.use(express.json());

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "x-method"],
  exposedHeaders: ["Content-Range", "X-Content-Range", "X-CSRF-Token"],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));


app.use((req, res, next) => {
  const allowedOrigin = process.env.CLIENT_URL;
  const requestOrigin = req.headers.origin;

  if (!requestOrigin || requestOrigin !== allowedOrigin) {
    return res.status(403).json({
      error: "Access denied. Unauthorized origin."
    });
  }
  next();
});

app.use(helmet()); // Ajouter des en-têtes de sécurité

// Middleware pour parser les cookies
app.use(cookieParser());

// Limiter les requêtes à 100 par heure par IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // max 1000 requêtes par minute
  message: 'Trop de requêtes, réessayez dans une minute.',
});

app.use(limiter);

// Routes
app.use('/api/users', UserRouter);

// Fonction pour démarrer le serveur
function startServer() {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

db.initializeDatabase()
  .then(() => startServer())
  .catch((error) => {
    console.error("Erreur lors de l'initialisation de l'application :", error);
    process.exit(1); // Arrêter l'application en cas d'échec critique
  });

// db.dropIndex();
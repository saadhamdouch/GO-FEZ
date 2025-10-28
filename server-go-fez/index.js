const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();

const db = require("./Config/db.js"); // Importer l'instance Singleton de la base de données
const models = require("./models/index.js");
const { cleanupExpiredOTPs } = require("./services/cronJobs.js");

const { UserRouter } = require("./routes/UserRoute.js"); // Importer les routes utilisateur
const CityRoute = require("./routes/CityRoute.js");
const ThemeRoute = require("./routes/ThemeRoute.js");
const CircuitRoutes = require("./routes/CircuitRoutes.js");
const categoryRoutes = require("./routes/categoryRoutes.js");
const { POIRouter } = require("./routes/POIRoute.js"); // Importer les routes POI
const { ConfigRouter } = require("./routes/ConfigRoute.js");
const { GamificationRouter } = require("./routes/gamificationRouter.js");
const pointsTransactionRoutes = require('./routes/pointsTransactionRoutes.js');
const savePOIRoutes = require('./routes/SavePOIRoutes.js');


const app = express();
const { header } = require("express-validator");
const rateLimit = require("express-rate-limit");

// Charger les variables sensibles depuis le fichier .env
const PORT = process.env.PORT || 8080;
const ALLOWED_ORIGINS = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'null'
];


console.log(process.env.CLIENT_URL);
app.use(
cors({
       
        origin: (origin, callback) => {
            if (!origin || ALLOWED_ORIGINS.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'), false);
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-CSRF-Token",
            "x-method",
        ],
        exposedHeaders: ["Content-Range", "X-Content-Range", "X-CSRF-Token"],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    })
);

app.use(helmet()); // Ajouter des en-têtes de sécurité

// Middleware pour parser les cookies
app.use(cookieParser());

// Limiter les requêtes à 100 par heure par IP
const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 1000, // max 1000 requêtes par minute
	message: "Trop de requêtes, réessayez dans une minute.",
});

app.use(limiter);

const jsonMiddleware = express.json({ limit: '50mb' });

// Routes avec files (multer)
app.use('/api/themes/', ThemeRoute);
app.use('/api/circuits', CircuitRoutes);
app.use('/api/city', CityRoute);
app.use('/api/pois', POIRouter);

// Routes sans files
app.use('/api/users', jsonMiddleware, UserRouter);
app.use('/api/categorys', jsonMiddleware, categoryRoutes);
app.use('/api/config', jsonMiddleware, ConfigRouter);
app.use('/api/gamification', jsonMiddleware, GamificationRouter);
app.use('/api/pointsTransaction', jsonMiddleware, pointsTransactionRoutes);
app.use('/api/save-poi', jsonMiddleware, savePOIRoutes);

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
    console.error('❌ Erreur:', err.message);
    
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Erreur serveur'
    });
});

// Fonction pour démarrer le serveur
function startServer() {
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
}

db.initializeDatabase()
	.then(() => {
		// Démarrer le serveur
		startServer();
		
		// Démarrer le job CRON pour nettoyer les OTP expirés
		cleanupExpiredOTPs.start();
		console.log('✅ Job CRON de nettoyage des OTP expirés démarré');
	})
	.catch((error) => {
		console.error(
			"Erreur lors de l'initialisation de l'application :",
			error
		);
		process.exit(1); // Arrêter l'application en cas d'échec critique
	});

//  db.dropAllIndexes()

//  db.dropFacebookIdIndex()
//  db.dropGoogleIdIndex()
//  db.dropPhoneIndex()
//  db.dropPrimaryIdentifierIndex()

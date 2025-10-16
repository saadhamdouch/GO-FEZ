const jwt = require('jsonwebtoken');
const { User } = require('../models/User.js');
require('dotenv').config();

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET;

// ========================================
// MIDDLEWARE D'AUTHENTIFICATION
// ========================================

/**
 * 🔐 Middleware d'authentification JWT
 * Vérifie la présence et la validité du token JWT depuis les cookies
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Récupération du token depuis le cookie
        const token = req.cookies.tk;

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token d\'accès requis',
                code: 'TOKEN_MISSING'
            });
        }

        // Vérification du token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Vérification que l'utilisateur existe toujours
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Utilisateur non trouvé',
                code: 'USER_NOT_FOUND'
            });
        }

        // Ajout des informations utilisateur à la requête
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            primaryIdentifier: decoded.primaryIdentifier,
            authProvider: decoded.authProvider
        };
        req.isAuthenticated = true;

        next();

    } catch (error) {
        console.log('Erreur d\'authentification:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Token invalide',
                code: 'TOKEN_INVALID'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expiré',
                code: 'TOKEN_EXPIRED'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Erreur d\'authentification',
            code: 'AUTH_ERROR'
        });
    }
};

/**
 * 🛡️ Middleware de vérification de rôle
 * Vérifie que l'utilisateur a le rôle requis
 */
const requireRole = (requiredRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentification requise',
                    code: 'AUTH_REQUIRED'
                });
            }

            // Convertir en tableau si c'est une string
            const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

            // Vérifier si l'utilisateur a l'un des rôles requis
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    error: 'Permissions insuffisantes',
                    code: 'INSUFFICIENT_PERMISSIONS',
                    required: roles,
                    current: req.user.role
                });
            }

            next();

        } catch (error) {
            console.log('Erreur de vérification de rôle:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur de vérification des permissions',
                code: 'ROLE_CHECK_ERROR'
            });
        }
    };
};

/**
 * 👑 Middleware pour les administrateurs uniquement
 */
const requireAdmin = requireRole('admin');

/**
 * 🔧 Middleware pour les modérateurs et administrateurs
 */
const requireModerator = requireRole(['admin', 'moderator']);

/**
 * ✅ Middleware pour les utilisateurs vérifiés uniquement
 */
const requireVerified = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentification requise',
                code: 'AUTH_REQUIRED'
            });
        }

        // Récupération des informations complètes de l'utilisateur
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Utilisateur non trouvé',
                code: 'USER_NOT_FOUND'
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                error: 'Compte non vérifié',
                code: 'ACCOUNT_NOT_VERIFIED',
                message: 'Veuillez vérifier votre numéro de téléphone pour accéder à cette fonctionnalité'
            });
        }

        next();

    } catch (error) {
        console.log('Erreur de vérification du statut:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur de vérification du statut',
            code: 'VERIFICATION_ERROR'
        });
    }
};

/**
 * 🔄 Middleware optionnel d'authentification
 * N'échoue pas si le token est absent, mais ajoute les infos si présent
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.tk;

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const user = await User.findByPk(decoded.userId);
                
                if (user) {
                    req.user = {
                        userId: decoded.userId,
                        email: decoded.email,
                        role: decoded.role,
                        primaryIdentifier: decoded.primaryIdentifier,
                        authProvider: decoded.authProvider
                    };
                }
            } catch (tokenError) {
                // Token invalide, mais on continue sans authentification
                console.log('Token invalide dans optionalAuth:', tokenError.message);
            }
        }

        next();

    } catch (error) {
        console.log('Erreur dans optionalAuth:', error);
        next(); // Continue même en cas d'erreur
    }
};

/**
 * 🚫 Middleware pour empêcher l'accès aux utilisateurs connectés
 * Utile pour les pages de connexion/inscription
 */
const requireGuest = (req, res, next) => {
    if (req.user) {
        return res.status(400).json({
            success: false,
            error: 'Vous êtes déjà connecté',
            code: 'ALREADY_AUTHENTICATED'
        });
    }
    next();
};

/**
 * 🔒 Middleware de vérification de propriété
 * Vérifie que l'utilisateur est propriétaire de la ressource ou admin
 */
const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentification requise',
                    code: 'AUTH_REQUIRED'
                });
            }

            // Les administrateurs peuvent accéder à tout
            if (req.user.role === 'admin') {
                return next();
            }

            // Vérification de la propriété
            const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
            
            if (parseInt(resourceUserId) !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Accès non autorisé à cette ressource',
                    code: 'RESOURCE_ACCESS_DENIED'
                });
            }

            next();

        } catch (error) {
            console.log('Erreur de vérification de propriété:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur de vérification des permissions',
                code: 'OWNERSHIP_CHECK_ERROR'
            });
        }
    };
};

/**
 * 📊 Middleware de logging des accès
 * Enregistre les tentatives d'accès pour le monitoring
 */
const logAccess = (req, res, next) => {
    const startTime = Date.now();
    
    // Log de la requête
    console.log(`Accès API: ${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.userId,
        timestamp: new Date().toISOString()
    });

    // Intercepter la réponse pour logger le temps de traitement
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - startTime;
        
        console.log(`Réponse API: ${req.method} ${req.path}`, {
            statusCode: res.statusCode,
            duration: `${duration} ms`,
            userId: req.user?.userId
        });

        originalSend.call(this, data);
    };

    next();
};

/**
 * 🛡️ Middleware de rate limiting par utilisateur
 * Limite le nombre de requêtes par utilisateur
 * le nombre des requêtes est de 1000 par minute
 */
const rateLimitByUser = (maxRequests = 1000, windowMs = 1 * 60 * 1000) => {
    const userRequests = new Map();

    return (req, res, next) => {
        if (!req.user) {
            return next(); // Pas de rate limiting pour les utilisateurs non connectés
        }

        const userId = req.user.userId;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Nettoyer les anciennes entrées
        if (userRequests.has(userId)) {
            const requests = userRequests.get(userId).filter(time => time > windowStart);
            userRequests.set(userId, requests);
        } else {
            userRequests.set(userId, []);
        }

        const userRequestCount = userRequests.get(userId).length;

        if (userRequestCount >= maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'Trop de requêtes',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }

        // Ajouter la requête actuelle
        userRequests.get(userId).push(now);

        next();
    };
};

module.exports = {
    // Authentification de base
    authenticateToken,
    optionalAuth,
    requireGuest,
    
    // Vérification de rôles
    requireRole,
    requireAdmin,
    requireModerator,
    requireVerified,
    
    // Vérification de propriété
    requireOwnershipOrAdmin,
    
    // Monitoring et sécurité
    logAccess,
    rateLimitByUser
};
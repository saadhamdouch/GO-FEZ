const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { User } = require("../models/User");
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const otpStore = new Map();
const generateTokens = (user) => {
	console.log('🔑 Génération des tokens JWT', {
		userId: user.id,
		jwtSecretLength: JWT_SECRET.length,
		jwtSecretStart: JWT_SECRET.substring(0, 10) + '...',
		expiresIn: JWT_EXPIRES_IN
	});

	const token = jwt.sign(
		{
			userId: user.id,
		},
		JWT_SECRET,
		{ expiresIn: JWT_EXPIRES_IN }
	);

	const refreshToken = jwt.sign(
		{ userId: user.id },
		JWT_SECRET,
		{ expiresIn: JWT_REFRESH_EXPIRES_IN }
	);


	return { token, refreshToken };
}
const generateAndSetTokens = (user, res) => {
	const tokens = generateTokens(user);

	// Cookie pour le token d'accès (tk)
	res.cookie("tk", tokens.token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production', // HTTPS en production
		sameSite: "Lax",
		maxAge: 24 * 60 * 60 * 1000, // 24 heures
		path: "/",
	});

	// Cookie pour le refresh token
	res.cookie("refreshToken", tokens.refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production', // HTTPS en production
		sameSite: "Lax",
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
		path: "/",
	});

	return tokens;
}
// Middleware pour vérifier les erreurs de validation
const handleValidationErrors = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			success: false,
			message: "Erreurs de validation",
			errors: errors.array(),
		});
	}
	next();
};

// Méthode d'inscription (SignUp)
const registerUser = async (req, res) => {
	try {
		const { firstName, lastName, email, phone, password } = req.body;

		// Vérifier qu'au moins un identifiant est fourni
		if (!email && !phone) {
			return res.status(400).json({
				success: false,
				message: "Email ou numéro de téléphone requis",
			});
		}

		// Vérifier si l'utilisateur existe déjà
		const existingUser = await User.findOne({
			where: {
				[User.sequelize.Sequelize.Op.or]: [
					email ? { email } : null,
					phone ? { phone } : null,
				].filter(Boolean),
			},
		});

		if (existingUser) {
			return res.status(409).json({
				success: false,
				message:
					"Un utilisateur avec cet email ou numéro de téléphone existe déjà",
			});
		}

		// Hacher le mot de passe
		const saltRounds = 12;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Déterminer l'identifiant principal
		let primaryIdentifier = null;
		let authProvider = null;
		if (email === null || email === undefined) {
			primaryIdentifier = phone;
			authProvider = "phone";
		} else if (phone === null || phone === undefined) {
			primaryIdentifier = email;
			authProvider = "email";
		}

		// Créer l'utilisateur
		const newUser = await User.create({
			firstName,
			lastName,
			email: email || null,
			phone: phone || null,
			password: hashedPassword,
			authProvider: authProvider,
			primaryIdentifier,
			isVerified: false,
			role: "user",
		});

		// Générer le token JWT
		const token = jwt.sign(
			{
				userId: newUser.id,
				email: newUser.email,
				role: newUser.role,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "24h" }
		);

		// Retourner la réponse sans le mot de passe
		const userResponse = {
			id: newUser.id,
			firstName: newUser.firstName,
			lastName: newUser.lastName,
			email: newUser.email,
			phone: newUser.phone,
			authProvider: newUser.authProvider,
			isVerified: newUser.isVerified,
			role: newUser.role,
			createdAt: newUser.createdAt,
		};

		res.status(201).json({
			success: true,
			message: "Utilisateur créé avec succès",
			user: userResponse,
			token,
		});
	} catch (error) {
		console.error("Erreur lors de l'inscription:", error);
		res.status(500).json({
			success: false,
			message: "Erreur interne du serveur",
			error:
				process.env.NODE_ENV === "development"
					? error.message
					: undefined,
		});
	}
};

// Méthode de connexion (Login)
const loginUser = async (req, res) => {
	try {
		const { identifier, password } = req.body;

		// Trouver l'utilisateur par email ou téléphone
		const user = await User.findOne({
			where: {
				[User.sequelize.Sequelize.Op.or]: [
					{ email: identifier },
					{ phone: identifier },
				],
			},
		});

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Identifiants invalides",
			});
		}

		// Vérifier le mot de passe
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({
				success: false,
				message: "Identifiants invalides",
			});
		}

		// Générer le token JWT
		const tokens = generateAndSetTokens(user, res);
		// Retourner la réponse sans le mot de passe
		const userResponse = {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			phone: user.phone,
			authProvider: user.authProvider,
			isVerified: user.isVerified,
			role: user.role,
			createdAt: user.createdAt,
		};

		res.status(200).json({
			success: true,
			message: "Connexion réussie",
			user: userResponse,
			tokens,
		});
	} catch (error) {
		console.error("Erreur lors de la connexion:", error);
		res.status(500).json({
			success: false,
			message: "Erreur interne du serveur",
			error:
				process.env.NODE_ENV === "development"
					? error.message
					: undefined,
		});
	}
};

// Méthode pour obtenir le profil utilisateur
const getUserProfile = async (req, res) => {
	try {
		// The authenticateToken middleware has already verified the token
		// and added req.user with userId
		const userId = req.user.userId;

		// Récupérer l'utilisateur
		const user = await User.findByPk(userId, {
			attributes: { exclude: ["password"] },
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Utilisateur non trouvé",
			});
		}

		res.status(200).json({
			success: true,
			data: user, // Changed from 'user' to 'data' for consistency with other APIs
		});
	} catch (error) {
		console.error("Erreur lors de la récupération du profil:", error);
		res.status(500).json({
			success: false,
			message: "Erreur interne du serveur",
			error:
				process.env.NODE_ENV === "development"
					? error.message
					: undefined,
		});
	}
};

// Méthode pour mettre à jour le profil utilisateur
const updateUserProfile = async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({
				success: false,
				message: "Token d'authentification requis",
			});
		}

		const token = authHeader.substring(7);
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || "your-secret-key"
		);

		const { firstName, lastName, email, phone } = req.body;
		const updateData = { firstName, lastName, email, phone };

		// Ajouter l'image si elle est fournie
		if (req.file) {
			updateData.profileImage = req.file.path;
		}

		await User.update(updateData, {
			where: { id: decoded.userId },
		});

		res.status(200).json({
			success: true,
			message: "Profil mis à jour avec succès",
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour du profil:", error);
		res.status(500).json({
			success: false,
			message: "Erreur interne du serveur",
		});
	}
};

// Méthode pour récupérer tous les utilisateurs (admin)
const findAllUsers = async (req, res) => {
	try {
		const users = await User.findAll({
			attributes: { exclude: ["password"] },
			order: [["createdAt", "DESC"]],
		});

		res.status(200).json({
			success: true,
			users,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des utilisateurs:",
			error
		);
		res.status(500).json({
			success: false,
			message: "Erreur interne du serveur",
		});
	}
};

// Méthode pour récupérer un utilisateur par ID
const findOneUser = async (req, res) => {
	try {
		const { id } = req.params;

		const user = await User.findByPk(id, {
			attributes: { exclude: ["password"] },
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Utilisateur non trouvé",
			});
		}

		res.status(200).json({
			success: true,
			user,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la récupération de l'utilisateur:",
			error
		);
		res.status(500).json({
			success: false,
			message: "Erreur interne du serveur",
		});
	}
};
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requis' });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore.set(email, otp);

    console.log(`OTP for ${email}: ${otp}`); // For dev only

    return res.status(200).json({
      success: true,
      message: 'OTP envoyé avec succès',
    });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: 'Email et OTP requis' });

    const storedOtp = otpStore.get(email);
    if (!storedOtp)
      return res.status(400).json({ message: 'Aucun OTP trouvé pour cet email' });

    if (parseInt(otp) !== storedOtp)
      return res.status(400).json({ message: 'OTP invalide' });

    // Remove OTP after successful verification
    otpStore.delete(email);

    return res.status(200).json({ success: true, message: 'OTP vérifié avec succès' });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
const registerWithProvider = async (req, res) => {
  try {
    const { provider, id, firstName, lastName, email, phone } = req.body;

    if (!provider || !['google', 'facebook'].includes(provider)) {
      return res.status(400).json({ success: false, message: "Provider invalide" });
    }

    const primaryIdentifier = provider === 'google' ? email : id;

    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Sequelize.Op.or]: [
          { primaryIdentifier },
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existingUser) {
      const tokens = generateAndSetTokens(existingUser, res);
      return res.status(200).json({
        success: true,
        message: "Connexion réussie",
        user: {
          id: existingUser.id,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          phone: existingUser.phone,
          authProvider: existingUser.authProvider,
          primaryIdentifier: existingUser.primaryIdentifier,
          role: existingUser.role,
        },
        tokens,
      });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      authProvider: provider,
      primaryIdentifier,
      googleId: provider === 'google' ? id : null,
      facebookId: provider === 'facebook' ? id : null,
      facebookEmail: provider === 'facebook' ? email : null,
      facebookPhone: provider === 'facebook' ? phone : null,
      isVerified: true,
      role: "user",
    });

    const tokens = generateAndSetTokens(newUser, res);

    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        authProvider: newUser.authProvider,
        primaryIdentifier: newUser.primaryIdentifier,
        role: newUser.role,
      },
      tokens,
    });
  } catch (error) {
    console.error("Erreur provider signup:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// Méthode pour mettre à jour le mot de passe
const updatePassword = async (req, res) => {
	try {
		const { id } = req.params;
		const { currentPassword, newPassword } = req.body;

		const user = await User.findByPk(id);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Utilisateur non trouvé",
			});
		}

		// Vérifier le mot de passe actuel
		const isCurrentPasswordValid = await bcrypt.compare(
			currentPassword,
			user.password
		);
		if (!isCurrentPasswordValid) {
			return res.status(401).json({
				success: false,
				message: "Mot de passe actuel incorrect",
			});
		}

		// Hacher le nouveau mot de passe
		const saltRounds = 12;
		const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

		// Mettre à jour le mot de passe
		await User.update({ password: hashedNewPassword }, { where: { id } });

		res.status(200).json({
			success: true,
			message: "Mot de passe mis à jour avec succès",
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour du mot de passe:", error);
		res.status(500).json({
			success: false,
			message: "Erreur interne du serveur",
		});
	}
};

module.exports = {
	registerWithProvider,
	verifyOtp,
	sendOtp,
	handleValidationErrors,
	registerUser,
	loginUser,
	getUserProfile,
	updateUserProfile,
	findAllUsers,
	findOneUser,
	updatePassword,
};

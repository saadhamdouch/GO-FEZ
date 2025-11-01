const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { User } = require("../models/User");
const { EmailVerification } = require("../models/EmailVerification");
const { generateOTP, hashOTP, sendVerificationEmail } = require("../services/emailSender");
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
		const { firstName, lastName, email, password } = req.body;

		// Vérifier que l'email est fourni
		if (!email) {
			return res.status(400).json({
				success: false,
				message: "Email requis",
			});
		}

		// Vérifier si l'utilisateur existe déjà
		const existingUser = await User.findOne({
			where: { email }
		});

		if (existingUser) {
			return res.status(409).json({
				success: false,
				message: "Un utilisateur avec cet email existe déjà",
			});
		}

		// Hacher le mot de passe
		const saltRounds = 12;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Créer l'utilisateur avec isVerified: false
		const newUser = await User.create({
			firstName,
			lastName,
			email,
			password: hashedPassword,
			authProvider: "email",
			primaryIdentifier: email,
			isVerified: false,
			role: "user",
		});

		// Générer un code OTP à 6 chiffres
		const otp = generateOTP();
		
		// Hasher l'OTP avant de le sauvegarder
		const hashedOTP = await hashOTP(otp);

		// Calculer la date d'expiration (10 minutes)
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

		// Supprimer l'ancien OTP s'il existe pour cet email
		await EmailVerification.destroy({
			where: { email }
		});

		// Sauvegarder l'OTP dans la base de données
		await EmailVerification.create({
			email,
			otp: hashedOTP,
			expiresAt
		});

		// Envoyer l'email avec le code OTP
		if (process.env.SKIP_EMAIL !== 'true') {
			try {
				await sendVerificationEmail(email, otp);
				console.log(`📧 Code OTP envoyé à ${email}`);
			} catch (emailError) {
				console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError);
				console.log(`⚠️ Mode développement : Code OTP = ${otp}`);
			}
		} else {
			console.log(`⚠️ Email désactivé (SKIP_EMAIL=true). Code OTP = ${otp}`);
		}

		// Retourner la réponse sans le mot de passe
		const userResponse = {
			id: newUser.id,
			firstName: newUser.firstName,
			lastName: newUser.lastName,
			email: newUser.email,
			authProvider: newUser.authProvider,
			isVerified: newUser.isVerified,
			role: newUser.role,
			createdAt: newUser.createdAt,
		};

		res.status(201).json({
			success: true,
			message: "Utilisateur créé avec succès. Veuillez vérifier votre email pour activer votre compte.",
			user: userResponse,
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
		const { email, password } = req.body;

		// Vérifier que l'email est fourni
		if (!email) {
			return res.status(400).json({
				success: false,
				message: "Email requis",
			});
		}

		// Trouver l'utilisateur par email
		const user = await User.findOne({
			where: { email }
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
			authProvider: user.authProvider,
			isVerified: user.isVerified,
			role: user.role,
			createdAt: user.createdAt,
		};

		console.log('tokens : \n\n', tokens);

		res.status(200).json({
			success: true,
			message: "Connexion réussie",
			user: userResponse,
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

// Méthode pour renvoyer un code OTP
const resendOTP = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({
				success: false,
				message: "Email requis",
			});
		}

		// Vérifier que l'utilisateur existe
		const user = await User.findOne({ where: { email } });

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Aucun utilisateur trouvé avec cet email",
			});
		}

		// Vérifier que l'utilisateur n'est pas déjà vérifié
		if (user.isVerified) {
			return res.status(400).json({
				success: false,
				message: "Cet email est déjà vérifié",
			});
		}

		// Générer un nouveau code OTP
		const otp = generateOTP();
		
		// Hasher l'OTP
		const hashedOTP = await hashOTP(otp);

		// Calculer la nouvelle date d'expiration (10 minutes)
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

		// Supprimer l'ancien OTP
		await EmailVerification.destroy({
			where: { email }
		});

		// Créer un nouveau OTP
		await EmailVerification.create({
			email,
			otp: hashedOTP,
			expiresAt
		});

		// Envoyer l'email avec le nouveau code
		if (process.env.SKIP_EMAIL !== 'true') {
			try {
				await sendVerificationEmail(email, otp);
				console.log(`📧 Nouveau code OTP envoyé à ${email}`);
			} catch (emailError) {
				console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError);
				console.log(`⚠️ Mode développement : Nouveau code OTP = ${otp}`);
			}
		} else {
			console.log(`⚠️ Email désactivé (SKIP_EMAIL=true). Nouveau code OTP = ${otp}`);
		}

		res.status(200).json({
			success: true,
			message: "Un nouveau code de vérification a été envoyé à votre email",
		});
	} catch (error) {
		console.error("Erreur lors du renvoi de l'OTP:", error);
		res.status(500).json({
			success: false,
			message: "Erreur interne du serveur",
		});
	}
};

// Méthode pour vérifier l'OTP et activer le compte
const verifyOTP = async (req, res) => {
	try {
		const { email, otp } = req.body;

		if (!email || !otp) {
			return res.status(400).json({
				success: false,
				message: "Email et code OTP requis",
			});
		}

		// Récupérer l'enregistrement de vérification
		const verification = await EmailVerification.findOne({
			where: { email }
		});

		if (!verification) {
			return res.status(400).json({
				success: false,
				message: "Aucun code de vérification trouvé pour cet email",
			});
		}

		// Vérifier si l'OTP est expiré
		if (new Date(verification.expiresAt) < new Date()) {
			// Supprimer l'OTP expiré
			await EmailVerification.destroy({ where: { id: verification.id } });
			return res.status(400).json({
				success: false,
				message: "Le code OTP a expiré. Veuillez demander un nouveau code.",
			});
		}

		// Vérifier si le code OTP correspond
		const { verifyOTP: checkOTP } = require("../services/emailSender");
		const isOTPValid = await checkOTP(otp.toString(), verification.otp);

		if (!isOTPValid) {
			return res.status(400).json({
				success: false,
				message: "Code OTP invalide",
			});
		}

		// Mettre à jour l'utilisateur : isVerified = true
		await User.update(
			{ isVerified: true },
			{ where: { email }, validate: false }
		);

		// Supprimer l'enregistrement de vérification
		await EmailVerification.destroy({ where: { id: verification.id } });

		// Récupérer l'utilisateur vérifié pour générer les tokens
		const verifiedUser = await User.findOne({ where: { email } });

		if (!verifiedUser) {
			return res.status(404).json({
				success: false,
				message: "Utilisateur non trouvé",
			});
		}

		// Générer les tokens JWT
		const tokens = generateAndSetTokens(verifiedUser, res);

		console.log(`✅ Email vérifié pour : ${email}`);

		// Retourner la réponse sans le mot de passe
		const userResponse = {
			id: verifiedUser.id,
			firstName: verifiedUser.firstName,
			lastName: verifiedUser.lastName,
			email: verifiedUser.email,
			authProvider: verifiedUser.authProvider,
			isVerified: verifiedUser.isVerified,
			role: verifiedUser.role,
			createdAt: verifiedUser.createdAt,
		};

		res.status(200).json({
			success: true,
			message: "Email vérifié avec succès. Votre compte est maintenant actif.",
			user: userResponse,
			token: tokens.token,
		});
	} catch (error) {
		console.error("Erreur lors de la vérification de l'OTP:", error);
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
	verifyOTP,
	resendOTP,
	getUserProfile,
	updateUserProfile,
	findAllUsers,
	findOneUser,
	updatePassword,
};

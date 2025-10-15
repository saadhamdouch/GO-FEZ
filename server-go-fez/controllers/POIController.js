const { validationResult } = require("express-validator");
const { POI, POILocalization, POIFile } = require("../models");
const { uploadFile } = require("../Config/cloudinary");

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

// Méthode pour créer un POI
const createPOI = async (req, res) => {
	try {
		const {
			// Données principales du POI
			coordinates,
			category,
			practicalInfo,
			cityId,
			isActive = true,
			isVerified = false,
			isPremium = false,

			// Localisations multilingues
			arLocalization,
			frLocalization,
			enLocalization,

			// Fichiers multimédias
			poiFileData,
		} = req.body;

		// TODO: Logique de création du POI
		// 1. Créer les localisations (ar, fr, en) si fournies
		let arLocalizationData = null;
		let frLocalizationData = null;
		let enLocalizationData = null;
		if (arLocalization) {
			const arabicAudio = arLocalization.audioFileUrl;
			const arabicAudioUrl = await uploadFile(
				arabicAudio,
				"audio/arabic"
			);
			arLocalizationData = {
				name: arLocalization.name,
				description: arLocalization.description,
				address: arLocalization.address,
				audioFileUrl: arabicAudioUrl,
			};
		}
		if (frLocalization) {
			const frenchAudio = frLocalization.audioFileUrl;
			const frenchAudioUrl = await uploadFile(
				frenchAudio,
				"audio/french"
			);
			frLocalizationData = {
				name: frLocalization.name,
				description: frLocalization.description,
				address: frLocalization.address,
				audioFileUrl: frenchAudioUrl,
			};
		}
		if (enLocalization) {
			const englishAudio = enLocalization.audioFileUrl;
			const englishAudioUrl = await uploadFile(
				englishAudio,
				"audio/english"
			);
			enLocalizationData = {
				name: enLocalization.name,
				description: enLocalization.description,
				address: enLocalization.address,
				audioFileUrl: englishAudioUrl,
			};
		}
		// save data to database
		const arLocalizationResponse = await POILocalization.create(
			arLocalizationData
		);
		const frLocalizationResponse = await POILocalization.create(
			frLocalizationData
		);
		const enLocalizationResponse = await POILocalization.create(
			enLocalizationData
		);
		// 2. Créer le POIFile avec les URLs Cloudinary
		const image = poiFileData.image;
		const imageUrl = await uploadFile(image, "image/poi");
		const video = poiFileData.video;
		const videoUrl = await uploadFile(video, "video/poi");
		const virtualTour = poiFileData.virtualTour360;
		const virtualTourUrl = await uploadFile(virtualTour, "virtualTour/poi");
		const poiFile = {
			image: imageUrl,
			video: videoUrl,
			virtualTour360: virtualTourUrl,
		};
		const poiFileResponse = await POIFile.create(poiFile);
		// 3. Créer le POI principal avec toutes les relations
		if (
			!arLocalizationResponse ||
			!frLocalizationResponse ||
			!enLocalizationResponse
		) {
			return res.status(400).json({
				success: false,
				message: "Erreur lors de la création des localisations",
			});
		}
		if (!poiFileResponse) {
			return res.status(400).json({
				success: false,
				message: "Erreur lors de la création du fichier POI",
			});
		}
		const poi = {
			ar: arLocalizationResponse?.id,
			fr: frLocalizationResponse?.id,
			en: enLocalizationResponse?.id,
			coordinates: coordinates,
			category: category,
			practicalInfo: practicalInfo,
			cityId: cityId,
			isActive: isActive,
			isVerified: isVerified,
			isPremium: isPremium,
			poiFileId: poiFileResponse.id,
		};
		const poiResponse = await POI.create(poi);
		// 4. Retourner le POI créé avec ses relations
		if (!poiResponse) {
			return res.status(400).json({
				success: false,
				message: "Erreur lors de la création du POI",
			});
		}
		res.status(201).json({
			success: true,
			message: "POI créé avec succès",
			poi: poiResponse,
		});
	} catch (error) {
		console.error("Erreur lors de la création du POI:", error);
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

// Méthode pour récupérer tous les POI
const findAllPOIs = async (req, res) => {
	try {
		// TODO: Logique de récupération des POI
		res.status(200).json({
			success: true,
			message: "Logique de récupération à implémenter",
			pois: [],
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des POI:", error);
		res.status(500).json({
			success: false,
			message: "Erreur interne du serveur",
		});
	}
};

// Méthode pour récupérer un POI par ID
const findOnePOI = async (req, res) => {
	try {
		const { id } = req.params;

		// TODO: Logique de récupération d'un POI par ID
		res.status(200).json({
			success: true,
			message: "Logique de récupération par ID à implémenter",
			poi: { id },
		});
	} catch (error) {
		console.error("Erreur lors de la récupération du POI:", error);
		res.status(500).json({
			success: false,
			message: "Erreur interne du serveur",
		});
	}
};

// Méthode pour mettre à jour un POI
const updatePOI = async (req, res) => {
	try {
		const { id } = req.params;

		// TODO: Logique de mise à jour du POI
		res.status(200).json({
			success: true,
			message: "POI mis à jour avec succès",
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour du POI:", error);
		res.status(500).json({
			success: false,
			message: "Erreur interne du serveur",
		});
	}
};

// Méthode pour supprimer un POI
const deletePOI = async (req, res) => {
	try {
		const { id } = req.params;

		// TODO: Logique de suppression du POI
		res.status(200).json({
			success: true,
			message: "POI supprimé avec succès",
		});
	} catch (error) {
		console.error("Erreur lors de la suppression du POI:", error);
		res.status(500).json({
			success: false,
			message: "Erreur interne du serveur",
		});
	}
};

module.exports = {
	handleValidationErrors,
	createPOI,
	findAllPOIs,
	findOnePOI,
	updatePOI,
	deletePOI,
};

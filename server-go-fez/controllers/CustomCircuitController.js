// server-go-fez/controllers/CustomCircuitController.js

const { CustomCircuit, POI, POILocalization } = require('../models');
const xss = require('xss');

/**
 * Créer un nouveau circuit personnalisé
 * @body { name, selectedPOIs (array of IDs), startDate?, estimatedDuration?, isPublic? }
 * @user { userId }
 */
exports.createCustomCircuit = async (req, res) => {
	try {
		const { name, selectedPOIs, startDate, estimatedDuration, isPublic } =
			req.body;
		const userId = req.user.userId; // Supposé provenir de l'auth middleware

		if (!name || !selectedPOIs || !Array.isArray(selectedPOIs)) {
			return res.status(400).json({
				success: false,
				message: 'name et selectedPOIs (tableau) sont requis.',
			});
		}

		// Validation simple: s'assurer que les POIs existent (optionnel mais recommandé)
		// const poisExist = await POI.count({ where: { id: selectedPOIs, isDeleted: false } });
		// if (poisExist !== selectedPOIs.length) {
		//   return res.status(400).json({ success: false, message: "Certains POIs sélectionnés n'existent pas." });
		// }

		const newCircuit = await CustomCircuit.create({
			userId,
			name: xss(name),
			selectedPOIs: selectedPOIs, // L'ordre est conservé tel quel
			startDate: startDate || null,
			estimatedDuration: estimatedDuration || null,
			isPublic: isPublic === true || isPublic === 'true',
		});

		res.status(201).json({
			success: true,
			message: 'Circuit personnalisé créé avec succès.',
			data: newCircuit,
		});
	} catch (error) {
		console.error(
			'Erreur lors de la création du circuit personnalisé:',
			error
		);
		res.status(500).json({
			success: false,
			message: 'Erreur interne du serveur.',
		});
	}
};

/**
 * Récupérer tous les circuits personnalisés de l'utilisateur connecté
 * @user { userId }
 */
exports.getUserCustomCircuits = async (req, res) => {
	try {
		const userId = req.user.userId;

		const circuits = await CustomCircuit.findAll({
			where: { userId, isDeleted: false },
			order: [['createdAt', 'DESC']],
		});

		res.status(200).json({
			success: true,
			data: circuits,
		});
	} catch (error) {
		console.error(
			'Erreur lors de la récupération des circuits personnalisés:',
			error
		);
		res.status(500).json({
			success: false,
			message: 'Erreur interne du serveur.',
		});
	}
};

/**
 * Récupérer un circuit personnalisé par ID (avec détails des POIs)
 * @params { id } (ID du circuit personnalisé)
 * @user { userId }
 */
exports.getCustomCircuitById = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.userId;

		const circuit = await CustomCircuit.findOne({
			where: { id, isDeleted: false },
		});

		if (!circuit) {
			return res
				.status(404)
				.json({ success: false, message: 'Circuit non trouvé.' });
		}

		// Vérifier si l'utilisateur est propriétaire OU si le circuit est public
		if (!circuit.isPublic && circuit.userId !== userId) {
			return res
				.status(403)
				.json({ success: false, message: 'Accès non autorisé.' });
		}

		// Récupérer les détails des POIs inclus dans ce circuit
		const poiDetails = await POI.findAll({
			where: {
				id: circuit.selectedPOIs,
				isDeleted: false,
			},
			include: [
				{ model: POILocalization, as: 'frLocalization' },
				{ model: POILocalization, as: 'arLocalization' },
				{ model: POILocalization, as: 'enLocalization' },
			],
		});

		// Ordonner les POIs selon l'ordre dans selectedPOIs
		const orderedPoiDetails = circuit.selectedPOIs.map((poiId) =>
			poiDetails.find((p) => p.id === poiId)
		).filter(Boolean); // Filter(Boolean) enlève les POIs non trouvés

		res.status(200).json({
			success: true,
			data: {
				...circuit.toJSON(),
				pois: orderedPoiDetails, // Ajouter les détails ordonnés des POIs
			},
		});
	} catch (error) {
		console.error(
			"Erreur lors de la récupération d'un circuit personnalisé:",
			error
		);
		res.status(500).json({
			success: false,
			message: 'Erreur interne du serveur.',
		});
	}
};

/**
 * Mettre à jour un circuit personnalisé
 * @params { id }
 * @body { name?, selectedPOIs?, startDate?, estimatedDuration?, isPublic? }
 * @user { userId }
 */
exports.updateCustomCircuit = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.userId;
		const { name, selectedPOIs, startDate, estimatedDuration, isPublic } =
			req.body;

		const circuit = await CustomCircuit.findOne({
			where: { id, userId, isDeleted: false }, // L'utilisateur doit être le propriétaire
		});

		if (!circuit) {
			return res.status(404).json({
				success: false,
				message:
					'Circuit non trouvé ou vous n\'êtes pas autorisé à le modifier.',
			});
		}

		// Construire l'objet de mise à jour
		const updateData = {};
		if (name !== undefined) updateData.name = xss(name);
		if (selectedPOIs !== undefined && Array.isArray(selectedPOIs))
			updateData.selectedPOIs = selectedPOIs;
		if (startDate !== undefined) updateData.startDate = startDate;
		if (estimatedDuration !== undefined)
			updateData.estimatedDuration = estimatedDuration;
		if (isPublic !== undefined) updateData.isPublic = isPublic;

		const updatedCircuit = await circuit.update(updateData);

		res.status(200).json({
			success: true,
			message: 'Circuit mis à jour avec succès.',
			data: updatedCircuit,
		});
	} catch (error) {
		console.error('Erreur lors de la mise à jour du circuit:', error);
		res.status(500).json({
			success: false,
			message: 'Erreur interne du serveur.',
		});
	}
};

/**
 * Supprimer un circuit personnalisé (logique)
 * @params { id }
 * @user { userId }
 */
exports.deleteCustomCircuit = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.userId;

		const circuit = await CustomCircuit.findOne({
			where: { id, userId, isDeleted: false }, // L'utilisateur doit être propriétaire
		});

		if (!circuit) {
			return res.status(404).json({
				success: false,
				message:
					'Circuit non trouvé ou vous n\'êtes pas autorisé à le supprimer.',
			});
		}

		// Suppression logique
		await circuit.update({ isDeleted: true });

		res.status(200).json({
			success: true,
			message: 'Circuit supprimé avec succès.',
		});
	} catch (error) {
		console.error('Erreur lors de la suppression du circuit:', error);
		res.status(500).json({
			success: false,
			message: 'Erreur interne du serveur.',
		});
	}
};
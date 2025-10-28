// server-go-fez/controllers/StatisticsController.js

const {
	User,
	POI,
	Circuit,
	CustomCircuit,
	Review,
	Partner,
	Subscription,
	CircuitProgress,
	POILocalization, // Importer POILocalization pour les noms
	sequelize,
} = require('../models');


/**
 * Récupère des statistiques d'aperçu pour le tableau de bord admin.
 */
const getOverviewStats = async (req, res) => {
	try {
		const totalUsers = await User.count();
		const verifiedUsers = await User.count({ where: { isVerified: true } });
		const totalPois = await POI.count({ where: { isDeleted: false } });
		const verifiedPois = await POI.count({
			where: { isVerified: true, isDeleted: false },
		});
		const activeCircuits = await Circuit.count({
			where: { isActive: true, isDeleted: false },
		});
		const customCircuits = await CustomCircuit.count({
			where: { isDeleted: false },
		});
		const totalReviews = await Review.count({ where: { isDeleted: false } });
		const activePartners = await Partner.count({
			where: { isActive: true, isDeleted: false },
		});
		const activeSubscriptions = await Subscription.count({
			where: { status: 'active' },
		});
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const completedThisMonth = await CircuitProgress.count({

        });

		res.status(200).json({
			success: true,
			data: {
				totalUsers,
				verifiedUsers,
				totalPois,
				verifiedPois,
				activeCircuits,
				customCircuits,
				totalReviews,
				activePartners,
				activeSubscriptions,
                completedCircuitsThisMonth: completedThisMonth,
			},
		});
	} catch (error) {
		console.error('Erreur lors de la récupération des statistiques:', error);
		res.status(500).json({
			success: false,
			message: 'Erreur interne du serveur.',
		});
	}
};

// --- NOUVELLES FONCTIONS DÉTAILLÉES ---

/**
 * Récupère la croissance des utilisateurs (nouvelles inscriptions par jour).
 * @query { days? (nombre de jours passés, défaut 7) }
 */
const getUserGrowth = async (req, res) => { 
	try {
		const days = parseInt(req.query.days || '7', 10);
		const today = new Date();
		today.setHours(23, 59, 59, 999); // Fin de la journée d'aujourd'hui

		const dateArray = [];
		const countsArray = [];

		for (let i = 0; i < days; i++) {
			const targetDate = new Date(today);
			targetDate.setDate(today.getDate() - i);
			const startOfDay = new Date(targetDate);
			startOfDay.setHours(0, 0, 0, 0);
			const endOfDay = new Date(targetDate);
			endOfDay.setHours(23, 59, 59, 999);

			const count = await User.count({

			});

			// Ajouter au début pour avoir l'ordre chronologique
			dateArray.unshift(startOfDay.toISOString().split('T')[0]); // Format YYYY-MM-DD
			countsArray.unshift(count);
		}

		res.status(200).json({
			success: true,
			data: {
				labels: dateArray, // Dates
				data: countsArray, // Nombre d'inscriptions
			},
		});
	} catch (error) {
		console.error('Erreur lors du calcul de la croissance utilisateur:', error);
		res.status(500).json({
			success: false,
			message: 'Erreur interne du serveur.',
		});
	}
};

/**
 * Récupère les POIs les plus populaires (basé sur le nombre d'avis).
 * @query { limit? (nombre de POIs à retourner, défaut 5) }
 */
const getPopularPois = async (req, res) => {
	try {
		const limit = parseInt(req.query.limit || '5', 10);

		const popularPois = await POI.findAll({
			where: { isDeleted: false },
			// Inclure les localisations pour le nom
			include: [
				{
					model: POILocalization,
					as: 'frLocalization',
					attributes: ['name'],
				},
				{
					model: POILocalization,
					as: 'enLocalization', // Optionnel, si besoin
					attributes: ['name'],
				},
                // Vous pouvez aussi inclure la catégorie, la ville etc.
			],
			// Compter le nombre d'avis associés
			attributes: {
				include: [
					[
						sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM "Reviews" AS r
                            WHERE
                                r."poiId" = "POI"."id"
                                AND r."isDeleted" = false
                        )`),
						'reviewCountLiteral', // Utiliser un alias différent de celui du modèle
					],
				],
                // Exclure les champs non nécessaires pour alléger la réponse
                exclude: ['ar', 'en', 'fr', 'coordinates', 'category', 'cityId', 'poiFileId', 'practicalInfo', 'isDeleted', 'createdAt', 'updatedAt']
			},
			// Trier par le nombre d'avis (calculé)
			order: [[sequelize.literal('"reviewCountLiteral"'), 'DESC']],
			limit: limit,
		});

        // Mapper pour simplifier la structure de la réponse
        const formattedPois = popularPois.map(poi => ({
            id: poi.id,
            name: poi.frLocalization?.name || poi.enLocalization?.name || 'N/A',
            rating: poi.rating,
            reviewCount: poi.reviewCount, // Note: reviewCountLiteral devrait être égal à poi.reviewCount si la mise à jour est correcte
            isVerified: poi.isVerified,
            isPremium: poi.isPremium,
            isActive: poi.isActive
        }));

		res.status(200).json({
			success: true,
			data: formattedPois,
		});
	} catch (error) {
		console.error('Erreur lors de la récupération des POIs populaires:', error);
		res.status(500).json({
			success: false,
			message: 'Erreur interne du serveur.',
		});
	}
};


module.exports = {
	getOverviewStats,
    getUserGrowth,    // Exporter la nouvelle fonction
    getPopularPois,   // Exporter la nouvelle fonction
};
const { PointsTransaction, User, GamificationRule } = require("../models");

/**
 * Enregistre une nouvelle transaction de points.
 */
async function createPointsTransaction(req, res) {
    try {
        const { userId, points, gamificationRuleId } = req.body;

        if (!userId || !gamificationRuleId) {
            return res.status(400).json({
                status: "failure",
                data: "User ID and Gamification Rule ID are required.",
            });
        }

        // Vérification de l'existence de l'utilisateur
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                status: "failure",
                data: "User not found",
            });
        }
        let finalPoints = points;

        // Si gamificationRuleId est fourni, vérifier qu'il existe et est actif
        if (gamificationRuleId) {
            const rule = await GamificationRule.findByPk(gamificationRuleId);
            if (!rule) {
                return res.status(404).json({
                    status: "failure",
                    data: "Gamification rule not found",
                });
            }
            
            finalPoints = rule.points; // S'assurer que les points correspondent à la règle 
        }

        // 1. Créer la transaction
        const transaction = await PointsTransaction.create({
            userId,
            points: finalPoints,
            gamificationRuleId: gamificationRuleId || null,
        });

        // 2. Mettre à jour les points de l'utilisateur

        res.status(201).json({ status: "success", data: transaction });
    } catch (error) {
        console.error("server error in points transaction creation:", error);
        res.status(500).json({
            status: "server_failure",
            message: "Server Error",
        });
    }
}

/**
 * Récupère toutes les transactions pour un utilisateur spécifique.
 */
async function findUserTransactions(req, res) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                status: "failure",
                data: "userId is required",
            });
        }

        const transactions = await PointsTransaction.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            include: [{ model: GamificationRule, as: 'rule' }], 
        });

        res.status(200).json({ status: "success", data: transactions });
    } catch (error) {
        console.error("server error in fetching user transactions:", error);
        res.status(500).json({
            status: "server_failure",
            message: "Server Error",
        });
    }
}

module.exports = { createPointsTransaction, findUserTransactions };
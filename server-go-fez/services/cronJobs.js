const cron = require('node-cron');
const { EmailVerification } = require('../models/EmailVerification');
const { Op } = require('sequelize');

/**
 * Job CRON pour supprimer automatiquement les codes OTP expirés
 * Exécution toutes les 10 minutes
 */
const cleanupExpiredOTPs = cron.schedule('*/10 * * * *', async () => {
  try {
    const now = new Date();
    
    // Supprimer tous les OTP expirés
    const deletedCount = await EmailVerification.destroy({
      where: {
        expiresAt: {
          [Op.lt]: now
        }
      }
    });

    if (deletedCount > 0) {
      console.log(`🧹 ${deletedCount} code(s) OTP expiré(s) supprimé(s) automatiquement`);
    }
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des OTP expirés:', error);
  }
});

module.exports = {
  cleanupExpiredOTPs
};


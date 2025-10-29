// server-go-fez/services/GamificationService.js
const { GamificationRule, UserPoints, Badge, UserBadge } = require('../models');

/**
 * Award points to a user for a specific activity
 * @param {string} userId - User ID
 * @param {string} activity - Activity type (e.g., 'COMPLETE_CIRCUIT')
 * @param {object} transaction - Sequelize transaction (optional)
 */
async function awardPoints(userId, activity, transaction = null) {
  try {
    // Get the rule for this activity
    const rule = await GamificationRule.findOne({
      where: { activity, isActive: true },
      transaction
    });

    if (!rule) {
      console.warn(`⚠️ No active rule found for activity: ${activity}`);
      return null;
    }

    // Get or create user points record
    let [userPoints, created] = await UserPoints.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        totalPoints: 0,
        level: 1
      },
      transaction
    });

    // Add points
    const newTotalPoints = userPoints.totalPoints + rule.points;
    const newLevel = Math.floor(newTotalPoints / 1000) + 1; // 1000 points per level

    await userPoints.update({
      totalPoints: newTotalPoints,
      level: newLevel
    }, { transaction });

    console.log(`✅ Awarded ${rule.points} points to user ${userId} for ${activity}`);

    // Check for badge unlocks
    await checkBadgeUnlocks(userId, newTotalPoints, activity, transaction);

    return {
      pointsAwarded: rule.points,
      totalPoints: newTotalPoints,
      level: newLevel
    };
  } catch (error) {
    console.error('❌ Error awarding points:', error);
    return null;
  }
}

/**
 * Check if user has unlocked any badges
 */
async function checkBadgeUnlocks(userId, totalPoints, activity, transaction = null) {
  try {
    // Get all badges user doesn't have yet
    const existingBadges = await UserBadge.findAll({
      where: { userId },
      attributes: ['badgeId'],
      transaction
    });

    const existingBadgeIds = existingBadges.map(ub => ub.badgeId);

    // Find badges user can unlock
    const availableBadges = await Badge.findAll({
      where: {
        id: { [require('sequelize').Op.notIn]: existingBadgeIds }
      },
      transaction
    });

    for (const badge of availableBadges) {
      let shouldUnlock = false;

      // Check point-based badges
      if (badge.requiredPoints && totalPoints >= badge.requiredPoints) {
        shouldUnlock = true;
      }

      // Check activity-based badges
      if (badge.requiredActivity && badge.requiredActivity === activity) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        await UserBadge.create({
          userId,
          badgeId: badge.id,
          earnedAt: new Date()
        }, { transaction });

        console.log(`🏆 User ${userId} unlocked badge: ${badge.nameFr}`);
      }
    }
  } catch (error) {
    console.error('❌ Error checking badge unlocks:', error);
  }
}

module.exports = {
  awardPoints,
  checkBadgeUnlocks
};
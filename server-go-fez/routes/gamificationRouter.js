const express = require("express");
const GamificationRouter = express.Router();
const GamificationController = require("../controllers/gamificationController");

GamificationRouter.post(
	"/create",
	GamificationController.createGamificationRule
);

GamificationRouter.patch(
	"/update",
	GamificationController.updateGamificationRule
);

GamificationRouter.post(
	"/complete-gamification",
	GamificationController.completeGamificatedTask
);

module.exports = { GamificationRouter };

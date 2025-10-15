const express = require("express");
const GamificationRouter = express.Router();
const GamificationController = require("../controllers/gamificationController");

GamificationRouter.post(
	"/create",
	GamificationController.createGamificationRule
);

module.exports = { GamificationRouter };

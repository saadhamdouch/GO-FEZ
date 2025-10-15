const xss = require("xss");
const { GamificationRule } = require("../models");

/**
 * Create a new gamification rule.
 * Expects: points, descriptionAr, descriptionFr, description, isActive, activity: enum(
				"COMPLETE_REGISTRATION",
				"COMPLETE_CIRCUIT",
				"COMPLETE_PREMIUM_CIRCUIT",
				"SHARE_WITH_FRIEND",
				"LEAVE_REVIEW",
				"VISIT_POI") in req.body
 */
async function createGamificationRule(req, res) {
	try {
		const {
			points,
			activity,
			isActive,
			description,
			descriptionAr,
			descriptionFr,
		} = req.body;

		console.log(req.body);

		[(null, undefined)].forEach((el) => {
			if (
				[
					points,
					activity,
					isActive,
					description,
					descriptionAr,
					descriptionFr,
				].includes(el)
			) {
				res.status(400).json({
					status: "failure",
					data: "failed to create gamification rule, arguments missing",
				});
				return;
			}
		});
		if (
			![
				"COMPLETE_REGISTRATION",
				"COMPLETE_CIRCUIT",
				"COMPLETE_PREMIUM_CIRCUIT",
				"SHARE_WITH_FRIEND",
				"LEAVE_REVIEW",
				"VISIT_POI",
			].includes(activity)
		) {
			res.status(400).json({
				status: "failure",
				data: "invalid value for field activity",
			});
			return;
		}
		const gamification_rule = await GamificationRule.create({
			points,
			activity,
			isActive,
			description: xss(description),
			descriptionAr: xss(descriptionAr),
			descriptionFr: xss(descriptionFr),
		});

		res.status(201).json({ status: "success", data: gamification_rule });
	} catch (error) {
		console.error("server erreur in gamification rule creation:", error);
		res.status(500).json({
			status: "server_failure",
			message: "Server Error",
		});
	}
}

module.exports = { createGamificationRule };

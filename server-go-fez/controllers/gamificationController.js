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
/**
 * Update an existing gamification rule.
 * Expects: id in req.body, and any of points, descriptionAr, descriptionFr, description, isActive, activity in req.body to update.
 */
async function updateGamificationRule(req, res) {
	try {
		const {
			id,
			points,
			activity,
			isActive,
			description,
			descriptionAr,
			descriptionFr,
		} = req.body;

		if (!id) {
			return res.status(400).json({
				status: "failure",
				data: "id is required to update gamification rule",
			});
		}

		const updateFields = {};
		if (points !== undefined) updateFields.points = points;
		if (activity !== undefined) {
			const validActivities = [
				"COMPLETE_REGISTRATION",
				"COMPLETE_CIRCUIT",
				"COMPLETE_PREMIUM_CIRCUIT",
				"SHARE_WITH_FRIEND",
				"LEAVE_REVIEW",
				"VISIT_POI",
			];
			if (!validActivities.includes(activity)) {
				return res.status(400).json({
					status: "failure",
					data: "invalid value for field activity",
				});
			}
			updateFields.activity = activity;
		}
		if (isActive !== undefined) updateFields.isActive = isActive;
		if (description !== undefined)
			updateFields.description = xss(description);
		if (descriptionAr !== undefined)
			updateFields.descriptionAr = xss(descriptionAr);
		if (descriptionFr !== undefined)
			updateFields.descriptionFr = xss(descriptionFr);

		const [updatedRowsCount, updatedRows] = await GamificationRule.update(
			updateFields,
			{
				where: { id },
				returning: true,
			}
		);

		if (updatedRowsCount === 0) {
			return res.status(404).json({
				status: "failure",
				data: "gamification rule not found",
			});
		}

		console.log(updatedRows[0]);

		res.status(200).json({ status: "success", data: updatedRows[0] });
	} catch (error) {
		console.error("server error in gamification rule update:", error);
		res.status(500).json({
			status: "server_failure",
			message: "Server Error",
		});
	}
}

module.exports = { createGamificationRule, updateGamificationRule };

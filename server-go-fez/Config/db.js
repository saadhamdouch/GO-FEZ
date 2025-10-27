const { Sequelize } = require("sequelize");
require("dotenv").config();

// Créer une seule instance de Sequelize pour garantir une connexion unique
class Database {
	// host contructor
	constructor() {
		if (!Database.instance) {
			this.sequelize = new Sequelize(
				process.env.DB_NAME,
				process.env.DB_USER,
				process.env.DB_PASSWORD,
				{
					host: process.env.DB_HOST,
					dialect: "mysql",
					dialectOptions: {
						connectTimeout: 10000, // Temps d'attente en millisecondes (ici 10 secondes)
					},
					logging: false,
					port: 3306,
					pool: {
						max: 5,
						min: 0,
						acquire: 30000,
						idle: 10000,
					},
				}
			);
			Database.instance = this;
		}

		return Database.instance;
	}

	// Méthode pour initialiser la connexion à la base de données
	async initializeDatabase() {
		try {
			await this.sequelize.authenticate();
			console.log("Connexion à la base de données réussie !");
			// Vous pouvez décommenter cette ligne pour synchroniser les modèles si nécessaire

			if (process.env.ASYNC_DB === 'true') {
			 await this.sequelize.sync({ alter: true })
			 .then(() => {
			  console.log("Database synchronized");
			  })
			  .catch((error) => {
				   console.error("Error synchronizing the database:", error);
			  });
			}
			else {
				console.log("Database not synchronized because ASYNC_DB is not true");
			}
		} catch (error) {
			console.error(
				"Erreur lors de la connexion à la base de données :",
				error
			);
			throw error;
		}
	}

	async closeDatabase() {
		try {
			await this.sequelize.close();
			console.log("Connexion à la base de données fermée !");
		} catch (error) {
			console.error(
				"Erreur lors de la fermeture de la connexion :",
				error
			);
			throw error;
		}
	}

	// Accéder à l'instance de Sequelize
	getSequelize() {
		return this.sequelize;
	}

	// Suppression de l'index "email" sur la table "clients"
	async dropPhoneIndex() {
		try {
			await this.sequelize.query(
				"ALTER TABLE `users` DROP INDEX `phone`;"
			);
			console.log("✅ Index 'phone' supprimé avec succès.");
		} catch (error) {
			console.error(
				"❌ Erreur lors de la suppression de l'index 'phone' :",
				error
			);
		}
	}

	async dropPrimaryIdentifierIndex() {
		try {
			await this.sequelize.query(
				"ALTER TABLE `users` DROP INDEX `primary_identifier`;"
			);
			console.log("✅ Index 'primary_identifier' supprimé avec succès.");
		} catch (error) {
			console.error(
				"❌ Erreur lors de la suppression de l'index 'primary_identifier' :",
				error
			);
		}
	}

	async dropFacebookIdIndex() {
		try {
			await this.sequelize.query(
				"ALTER TABLE `users` DROP INDEX `facebook_id`;"
			);
			console.log("✅ Index 'facebook_id' supprimé avec succès.");
		} catch (error) {
			console.error(
				"❌ Erreur lors de la suppression de l'index 'facebook_id' :",
				error
			);
		}
	}

	async dropGoogleIdIndex() {
		try {
			await this.sequelize.query(
				"ALTER TABLE `users` DROP INDEX `google_id`;"
			);
			console.log("✅ Index 'google_id' supprimé avec succès.");
		} catch (error) {
			console.error(
				"❌ Erreur lors de la suppression de l'index 'google_id' :",
				error
			);
		}
	}

	// Méthode pour tout supprimer en appelant les méthodes individuelles
	async dropAllIndexes() {
		await this.dropPhoneIndex();
		await this.dropPrimaryIdentifierIndex();
		await this.dropFacebookIdIndex();
		await this.dropGoogleIdIndex();
		console.log("✅ Tous les index ont été supprimés.");
	}
}

module.exports = new Database();

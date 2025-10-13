const { createCitySchema, updateCitySchema } = require('../validations/CityValidation');
const { City } = require('../models/City');

class CityController {

    static async createCity(req, res) {
        try {
            const { error, value } = createCitySchema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: 'Erreur de validation des données.', details: error.details });
            }

            const existingCity = await City.findOne({ where: { nameEn: value.nameEn } });
            if (existingCity) {
                return res.status(409).json({ message: 'Cette ville est déjà enregistrée sous le nom anglais.' });
            }

            const newCity = await City.create(value);
            return res.status(201).json(newCity);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erreur de serveur lors de la création de la ville.', error: error.message });
        }
    }
     static async getAllCities(req, res) {
         try {
            
             const cities = await City.findAll({
                 attributes: ['id', 'name', 'nameAr', 'image', 'nameEn', 'country', 'isActive', 'radius'],
                 where: { isActive: true }, 
                 order: [['name', 'ASC']],
             });
             return res.status(200).json(cities);
         } catch (error) {
             console.error(error);
             return res.status(500).json({ message: 'Erreur de serveur lors de la récupération des villes.' });
         }
     }

    

    static async updateCity(req, res) {
        try {
            const { error, value } = updateCitySchema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: 'Erreur de validation des données.', details: error.details });
            }

            const [updatedRowsCount] = await City.update(value, {
                where: { id: req.params.id },
            });

            if (updatedRowsCount === 0) {
                return res.status(404).json({ message: 'Aucune ville trouvée pour mettre à jour.' });
            }

            const updatedCity = await City.findByPk(req.params.id);
            return res.status(200).json(updatedCity);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erreur de serveur lors de la mise à jour de la ville.' });
        }
    }
}

module.exports = CityController;
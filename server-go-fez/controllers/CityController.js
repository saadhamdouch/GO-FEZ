const { City } = require('../models');
const xss = require('xss');

//  Créer une ville
exports.createCity = async (req, res) => {
    try {
        const { name, nameAr, nameEn, country, radius, isActive } = req.body;

        if (!name || !nameAr || !nameEn || !country || !radius) {
            return res.status(400).json({ status: 'fail', message: 'Champs requis manquants' });
        }

        const sanitizedData = {
            name: xss(name),
            nameAr: xss(nameAr),
            nameEn: xss(nameEn),
            country: xss(country),
            radius: radius ? Number(radius) : null,
            isActive: isActive === 'true' || isActive === true,
            isDeleted: false
        };

        // TODO: Insertion de l'image depuis req.file vers Cloudinary
        const urlImage = "https://example.com";
        sanitizedData.image = urlImage;

        const existingCity = await City.findOne({ where: { name: sanitizedData.name, isDeleted: false } });
        if (existingCity) {
            return res.status(409).json({ status: 'fail', message: 'Cette ville existe déjà sous ce nom anglais.' });
        }

        const city = await City.create(sanitizedData);
        res.status(201).json({ status: 'success', data: city });
    } catch (error) {
        console.error('Erreur création ville :', error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur interne'});
    }
};

//  Récupérer toutes les villes
exports.getAllCities = async (req, res) => {
    try {
        const cities = await City.findAll({
            where: { isDeleted: false },
            order: [['name', 'ASC']]
        });
        res.status(200).json({ status: 'success', data: cities });
    } catch (error) {
        console.error('Erreur récupération villes :', error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur interne'});
    }
};

//  Mettre à jour une ville
exports.updateCity = async (req, res) => {
    try {
        const city = await City.findByPk(req.params.id);
        if (!city || city.isDeleted) {
            return res.status(404).json({ status: 'fail', message: 'Ville introuvable' });
        }

        const sanitizedData = {};
        if (req.body.name) sanitizedData.name = xss(req.body.name);
        if (req.body.nameAr) sanitizedData.nameAr = xss(req.body.nameAr);
        if (req.body.nameEn) sanitizedData.nameEn = xss(req.body.nameEn);
        if (req.body.country) sanitizedData.country = xss(req.body.country);
        if (req.body.radius) sanitizedData.radius = Number(req.body.radius);
        if (req.body.isActive !== undefined)
            sanitizedData.isActive = req.body.isActive === 'true' || req.body.isActive === true;

        if (req.file) {
            // TODO: si une image existe déjà, la supprimer de Cloudinary avant de mettre la nouvelle
            const urlImage = "https://example.com";
            sanitizedData.image = urlImage;
        }

        await city.update(sanitizedData);
        res.status(200).json({ status: 'success', data: city });
    } catch (error) {
        console.error('Erreur mise à jour ville :', error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur interne'});
    }
};

//  Suppression logique d’une ville
exports.deleteCity = async (req, res) => {
    try {
        const city = await City.findByPk(req.params.id);
        if (!city || city.isDeleted) {
            return res.status(404).json({ status: 'fail', message: 'Ville introuvable' });
        }

        await city.update({ isDeleted: true });
        res.status(200).json({ status: 'success', message: 'Ville supprimée avec succès' });
    } catch (error) {
        console.error('Erreur suppression ville :', error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur interne' });
    }
};

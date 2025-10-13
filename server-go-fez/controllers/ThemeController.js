const { Theme, Circuit } = require('../models');
// import xss from 'xss';
const xss = require('xss');

exports.createTheme = async (req, res) => {
    try {
        const { ar, fr, en, color, isActive } = req.body;
        const sanitizedData = {
            ar: xss(ar),
            fr: xss(fr),
            en: xss(en),
            color: xss(color),
            isActive: isActive === 'true' || isActive === true
        };
        // TODO: Insertion de l image depuis req.file vers cloudinary
        // TODO: Insertion de l icon depuis req.file vers cloudinary

        const urlImage = "https://example.com";
        const urlIcon = "https://example.com";
        sanitizedData.image = urlImage;
        sanitizedData.icon = urlIcon;
        const theme = await Theme.create(sanitizedData);
        res.status(201).json({ status: 'success', data: theme });
    } catch (error) {
        console.error('Erreur création thème :', error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur', error });
    }
};

exports.getAllThemes = async (req, res) => {
    try {
        const themes = await Theme.findAll({
            where: { isDeleted: false },
            include: [
                {
                    model: Circuit,
                    as: 'circuitsFromThemes', // même alias que celui défini dans ton association
                    through: { attributes: [] }, // on ne veut pas les champs intermédiaires
                    attributes: ['id'], // on récupère seulement l’id pour compter
                }
            ]
        });

        // Ajouter le nombre de circuits à chaque thème
        const data = themes.map(theme => ({
            ...theme.toJSON(),
            circuitsCount: theme.circuitsFromThemes ? theme.circuitsFromThemes.length : 0,
        }));

        res.status(200).json({ status: 'success', data });
    } catch (error) {
        console.error('Erreur récupération thèmes :', error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur', error });
    }
};

exports.getThemeById = async (req, res) => {
    try {
        const theme = await Theme.findByPk(req.params.id);
        if (!theme) {
            return res.status(404).json({ status: 'fail', message: 'Thème introuvable' });
        }
        res.status(200).json({ status: 'success', data: theme });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Erreur serveur', error });
    }
};

exports.updateTheme = async (req, res) => {
    try {
        const theme = await Theme.findByPk(req.params.id);
        if (!theme) {
            return res.status(404).json({ status: 'fail', message: 'Thème introuvable' });
        }
        //xss
        const sanitizedData = {};
        if (req.body.ar) sanitizedData.ar = xss(req.body.ar);
        if (req.body.fr) sanitizedData.fr = xss(req.body.fr);
        if (req.body.en) sanitizedData.en = xss(req.body.en);
        if (req.body.color) sanitizedData.color = xss(req.body.color);
        if (req.body.isActive !== undefined) sanitizedData.isActive = req.body.isActive === 'true' || req.body.isActive === true;

        if (req.file) {
            // TODO: if image or icon exists, we need to delete the old one from cloudinary and upload the new one, then update the url in the database
            // after uploading to cloudinary
            const urlImage = "https://example.com";
            sanitizedData.image = urlImage;
        }

        req.body = sanitizedData;
        await theme.update(req.body);
        res.status(200).json({ status: 'success', data: theme });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Erreur serveur', error });
    }
};

exports.deleteTheme = async (req, res) => {
    try {
        const theme = await Theme.findByPk(req.params.id);
        if (!theme) {
            return res.status(404).json({ status: 'fail', message: 'Thème introuvable' });
        }
        await theme.update({ isDeleted: true });
        res.status(204).json({ status: 'success', message: 'Thème supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Erreur serveur', error });
    }
};

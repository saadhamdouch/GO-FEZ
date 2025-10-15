const { Theme, Circuit } = require('../models');
const xss = require('xss');

exports.createTheme = async (req, res) => {
  try {
    const { ar, fr, en, color, isActive } = req.body;

    if (!ar || !fr || !en || !color) {
      return res.status(400).json({ status: 'fail', message: 'Champs requis manquants' });
    }

    const sanitizedData = {
      ar: xss(ar),
      fr: xss(fr),
      en: xss(en),
      color: xss(color),
      isActive: isActive === 'true' || isActive === true,
      image: "https://example.com",
      icon: "https://example.com"
    };

    const theme = await Theme.create(sanitizedData);
    res.status(201).json({ status: 'success', data: theme });
  } catch (error) {
    console.error('Erreur création thème :', error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur', error: error.message });
  }
};

exports.getAllThemes = async (req, res) => {
  try {
    const themes = await Theme.findAll({
      where: { isDeleted: false },
      include: [
        {
          model: Circuit,
          as: 'circuitsFromThemes',
          through: { attributes: [] },
          attributes: ['id']
        }
      ]
    });

    const data = themes.map(theme => ({
      ...theme.toJSON(),
      circuitsCount: theme.circuitsFromThemes?.length || 0
    }));

    res.status(200).json({ status: 'success', data });
  } catch (error) {
    console.error('Erreur récupération thèmes :', error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur', error: error.message });
  }
};

exports.getThemeById = async (req, res) => {
  try {
    const theme = await Theme.findOne({
      where: { id: req.params.id, isDeleted: false }
    });

    if (!theme) {
      return res.status(404).json({ status: 'fail', message: 'Thème introuvable' });
    }

    res.status(200).json({ status: 'success', data: theme });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Erreur serveur', error: error.message });
  }
};

exports.updateTheme = async (req, res) => {
  try {
    const theme = await Theme.findByPk(req.params.id);
    if (!theme || theme.isDeleted) {
      return res.status(404).json({ status: 'fail', message: 'Thème introuvable' });
    }

    const sanitizedData = {};
    if (req.body.ar) sanitizedData.ar = xss(req.body.ar);
    if (req.body.fr) sanitizedData.fr = xss(req.body.fr);
    if (req.body.en) sanitizedData.en = xss(req.body.en);
    if (req.body.color) sanitizedData.color = xss(req.body.color);
    if (req.body.isActive !== undefined)
      sanitizedData.isActive = req.body.isActive === 'true' || req.body.isActive === true;

    if (req.file) {
      // TODO: gestion de l'upload Cloudinary
      sanitizedData.image = "https://example.com";
    }

    await theme.update(sanitizedData);
    res.status(200).json({ status: 'success', data: theme });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Erreur serveur', error: error.message });
  }
};

exports.deleteTheme = async (req, res) => {
  try {
    const theme = await Theme.findByPk(req.params.id);
    if (!theme || theme.isDeleted) {
      return res.status(404).json({ status: 'fail', message: 'Thème introuvable' });
    }

    await theme.update({ isDeleted: true });
    res.status(200).json({ status: 'success', message: 'Thème supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Erreur serveur', error: error.message });
  }
};

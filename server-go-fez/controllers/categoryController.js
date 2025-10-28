const xss = require('xss');
const { Category, POI } = require('../models');

// 🔹 Fonction pour assainir les données multilingues
const sanitizeCategoryLocalizations = (localizations) => {
  const data = {};
  if (localizations.ar) {
    data.ar = {
      name: xss(localizations.ar.name || ''),
      desc: xss(localizations.ar.desc || '')
    };
  }
  if (localizations.fr) {
    data.fr = {
      name: xss(localizations.fr.name || ''),
      desc: xss(localizations.fr.desc || '')
    };
  }
  if (localizations.en) {
    data.en = {
      name: xss(localizations.en.name || ''),
      desc: xss(localizations.en.desc || '')
    };
  }
  return data;
};

//  Créer une catégorie
exports.createCategory = async (req, res) => {
  try {
    const { localizations, isActive } = req.body;

    if (!localizations || !localizations.ar || !localizations.fr || !localizations.en) {
      return res.status(400).json({
        status: 'fail',
        message: 'Champs de données requis (localizations) manquants.'
      });
    }

    const sanitizedLocalizations = sanitizeCategoryLocalizations(localizations);

    const category = await Category.create({
      ...sanitizedLocalizations,
      isActive: isActive === 'true' || isActive === true,
      isDeleted: false
    });

    res.status(201).json({ status: 'success', data: category });
  } catch (error) {
    console.error('❌ Erreur createCategory:', error);
    res.status(500).json({ status: 'fail', message: 'Erreur serveur' });
  }
};

//  Récupérer toutes les catégories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isDeleted: false },
      include: [
        {
          model: POI,
          as: 'pois',
          attributes: [],
          where: { isDeleted: false },
          required: false
        }
      ],
      attributes: {
        include: [
          [Category.sequelize.fn("COUNT", Category.sequelize.col("pois.id")), "nbPois"]
        ]
      },
      group: ['Category.id'],
      order: [['id', 'ASC']]
    });

    res.json({ status: 'success', data: categories });
  } catch (error) {
    console.error('❌ Erreur getAllCategories:', error);
    res.status(500).json({ status: 'fail', message: 'Erreur serveur' });
  }
};

// TODO : get paginated categories 10 per view

//  Récupérer une catégorie par ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id, isDeleted: false },
      include: [
        { model: POI, as: 'pois', where: { isDeleted: false }, required: false }
      ]
    });

    if (!category) {
      return res.status(404).json({ status: 'fail', message: 'Catégorie non trouvée' });
    }

    const nbPois = category.pois?.length || 0;

    res.json({ status: 'success', data: { ...category.toJSON(), nbPois } });
  } catch (error) {
    console.error('❌ Erreur getCategoryById:', error);
    res.status(500).json({ status: 'fail', message: 'Erreur serveur' });
  }
};

//  Mettre à jour une catégorie
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { localizations, isActive } = req.body;

    const category = await Category.findOne({ where: { id, isDeleted: false } });
    if (!category) {
      return res.status(404).json({ status: 'fail', message: 'Catégorie non trouvée' });
    }

    if (!localizations) {
      return res.status(400).json({ status: 'fail', message: 'Localizations manquants.' });
    }

    const sanitizedLocalizations = sanitizeCategoryLocalizations(localizations);

    await category.update({
      ...sanitizedLocalizations,
      isActive: isActive === 'true' || isActive === true
    });

    res.json({ status: 'success', data: category });
  } catch (error) {
    console.error('❌ Erreur updateCategory:', error);
    res.status(500).json({ status: 'fail', message: 'Erreur serveur' });
  }
};

//  Suppression logique d'une catégorie
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({ where: { id, isDeleted: false } });
    if (!category) {
      return res.status(404).json({ status: 'fail', message: 'Catégorie non trouvée' });
    }

    await category.update({ isDeleted: true });

    res.json({ status: 'success', message: 'Catégorie supprimée avec succès (logiquement)' });
  } catch (error) {
    console.error('❌ Erreur deleteCategory:', error);
    res.status(500).json({ status: 'fail', message: 'Erreur serveur' });
  }
};

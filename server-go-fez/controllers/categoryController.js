const xss = require('xss');
const { Category, POI } = require('../models');

exports.createCategory = async (req, res) => {
  try {
    const { ar, fr, en, isActive } = req.body;
    if (!ar || !fr || !en) {
      return res.status(400).json({ status: 'fail', message: 'Champs requis manquants' });
    }

    const category = await Category.create({
      ar: xss(ar),
      fr: xss(fr),
      en: xss(en),
      isActive: isActive === 'true' || isActive === true,
      isDeleted: false
    });

    res.status(201).json({ status: 'success', data: category });
  } catch (error) {
    console.error('Erreur createCategory:', error);
    res.status(500).json({ status: 'fail', message: 'Erreur serveur'});
  }
};

//  Récupérer toutes les catégories (sans celles supprimées)
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
    console.error('Erreur getAllCategories:', error);
    res.status(500).json({ status: 'fail', message: 'Erreur serveur'});
  }
};

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

    if (!category)
      return res.status(404).json({ status: 'fail', message: 'Catégorie non trouvée' });

    const nbPois = category.pois ? category.pois.length : 0;

    res.json({ status: 'success', data: { ...category.toJSON(), nbPois } });
  } catch (error) {
    console.error('Erreur getCategoryById:', error);
    res.status(500).json({ status: 'fail', message: 'Erreur serveur'});
  }
};

//  Mettre à jour une catégorie
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { ar, fr, en, isActive } = req.body;

    const category = await Category.findOne({ where: { id, isDeleted: false } });
    if (!category)
      return res.status(404).json({ status: 'fail', message: 'Catégorie non trouvée' });

    await category.update({
      ar: xss(ar),
      fr: xss(fr),
      en: xss(en),
      isActive
    });

    res.json({ status: 'success', data: category });
  } catch (error) {
    console.error('Erreur updateCategory:', error);
    res.status(500).json({ status: 'fail', message: 'Erreur serveur'});
  }
};

//  Suppression logique
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({ where: { id, isDeleted: false } });
    if (!category)
      return res.status(404).json({ status: 'fail', message: 'Catégorie non trouvée' });

    await category.update({ isDeleted: true });

    res.json({ status: 'success', message: 'Catégorie supprimée avec succès (logiquement)' });
  } catch (error) {
    console.error('Erreur deleteCategory:', error);
    res.status(500).json({ status: 'fail', message: 'Erreur serveur'});
  }
};

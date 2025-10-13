const {Category} = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const { ar, fr, en, isActive } = req.body;
    const category = await Category.create({ ar, fr, en, isActive });
    res.status(201).json({ status: 'success', data: category });
  } catch (error) {
    console.error('Erreur createCategory:', error);
    res.status(500).json({ status: 'fail', message: 'Erreur serveur' });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({ status: 'success', data: categories });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Erreur serveur' });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Catégorie non trouvée' });
    res.json({ status: 'success', data: category });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Erreur serveur' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { ar, fr, en, isActive } = req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Catégorie non trouvée' });

    await category.update({ ar, fr, en, isActive });
    res.json({ status: 'success', data: category });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Erreur serveur' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Catégorie non trouvée' });

    await category.destroy();
    res.json({ status: 'success', message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Erreur serveur' });
  }
};

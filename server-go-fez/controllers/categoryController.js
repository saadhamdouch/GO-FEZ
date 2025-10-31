const xss = require('xss');
const { Category, POI } = require('../models');
const { deleteFile } = require('../Config/cloudinary.js');

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
    console.log('📁 Fichier icône reçu:', req.file ? req.file.originalname : 'Aucun');
    console.log('📦 Données reçues:', req.body);

    const { localizations } = req.body;
    
    // Parser les localisations si elles sont envoyées comme des strings JSON
    let parsedLocalizations = localizations;
    
    // Si les localisations viennent comme un objet avec des strings JSON
    if (localizations && typeof localizations === 'object') {
      if (typeof localizations.ar === 'string') {
        try {
          parsedLocalizations.ar = JSON.parse(localizations.ar);
        } catch (e) {
          console.error('Erreur parsing localizations.ar:', e);
        }
      }
      if (typeof localizations.fr === 'string') {
        try {
          parsedLocalizations.fr = JSON.parse(localizations.fr);
        } catch (e) {
          console.error('Erreur parsing localizations.fr:', e);
        }
      }
      if (typeof localizations.en === 'string') {
        try {
          parsedLocalizations.en = JSON.parse(localizations.en);
        } catch (e) {
          console.error('Erreur parsing localizations.en:', e);
        }
      }
    }

    if (!parsedLocalizations || !parsedLocalizations.ar || !parsedLocalizations.fr || !parsedLocalizations.en) {
      return res.status(400).json({
        status: 'fail',
        message: 'Champs de données requis (localizations) manquants.'
      });
    }

    const sanitizedLocalizations = sanitizeCategoryLocalizations(parsedLocalizations);

    const category = await Category.create({
      ...sanitizedLocalizations,
      icon: req.file ? req.file.path : null, // URL Cloudinary
      iconPublicId: req.file ? req.file.filename : null, // Public ID Cloudinary
      isActive: req.body.isActive === 'true' || req.body.isActive === true,
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

  const page = parseInt(req.query.page) || 1; 
    const limit = 10; 
    const offset = (page - 1) * limit; 

    try {

        const totalItems = await Category.count({
            where: { isDeleted: false }
        });

        const categories = await Category.findAll({
            where: { isDeleted: false },
            
            subQuery: false, 
            
            limit: limit,
            offset: offset,
            
            include: [
                {
                    model: POI,
                    as: 'pois',
                    attributes: [],
                    where: { isDeleted: false },
                    required: false // LEFT JOIN
                }
            ],
            attributes: {

                include: [
                    [Category.sequelize.fn("COUNT", Category.sequelize.col("pois.id")), "nbPois"]
                ]
            },
            
           group: [
        'Category.id', 
        'Category.fr', 
        'Category.ar', 
        'Category.en', 
        'Category.isActive', 
        'Category.isDeleted', 
        'Category.created_at', 
        'Category.updated_at'
    ],
    order: [['id', 'ASC']]
        });

        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            status: 'success',
            data: categories,
            meta: {
                currentPage: page,
                perPage: limit,
                totalItems: totalItems,
                totalPages: totalPages,
            }
        });

    } catch (error) {
        console.error('❌ Erreur getPaginatedCategories:', error);
        res.status(500).json({ status: 'fail', message: 'Erreur serveur' });
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
    const { localizations } = req.body;

    const category = await Category.findOne({ where: { id, isDeleted: false } });
    if (!category) {
      return res.status(404).json({ status: 'fail', message: 'Catégorie non trouvée' });
    }

    if (!localizations) {
      return res.status(400).json({ status: 'fail', message: 'Localizations manquants.' });
    }

    // Parser les localisations si elles sont envoyées comme des strings JSON
    let parsedLocalizations = localizations;
    
    if (localizations && typeof localizations === 'object') {
      if (typeof localizations.ar === 'string') {
        try {
          parsedLocalizations.ar = JSON.parse(localizations.ar);
        } catch (e) {
          console.error('Erreur parsing localizations.ar:', e);
        }
      }
      if (typeof localizations.fr === 'string') {
        try {
          parsedLocalizations.fr = JSON.parse(localizations.fr);
        } catch (e) {
          console.error('Erreur parsing localizations.fr:', e);
        }
      }
      if (typeof localizations.en === 'string') {
        try {
          parsedLocalizations.en = JSON.parse(localizations.en);
        } catch (e) {
          console.error('Erreur parsing localizations.en:', e);
        }
      }
    }

    const sanitizedLocalizations = sanitizeCategoryLocalizations(parsedLocalizations);

    const updateData = {
      ...sanitizedLocalizations,
      isActive: req.body.isActive === 'true' || req.body.isActive === true
    };

    // Si une nouvelle icône est uploadée
    if (req.file) {
      // Supprimer l'ancienne icône de Cloudinary si elle existe
      if (category.iconPublicId) {
        console.log(`Suppression ancienne icône Cloudinary: ${category.iconPublicId}`);
        await deleteFile(category.iconPublicId);
      }
      updateData.icon = req.file.path; // URL Cloudinary
      updateData.iconPublicId = req.file.filename; // Public ID Cloudinary
    }

    await category.update(updateData);

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

    // Supprimer l'icône de Cloudinary si elle existe
    if (category.iconPublicId) {
      console.log(`Suppression icône Cloudinary: ${category.iconPublicId}`);
      await deleteFile(category.iconPublicId);
    }

    await category.update({ isDeleted: true });

    res.json({ status: 'success', message: 'Catégorie supprimée avec succès (logiquement)' });
  } catch (error) {
    console.error('❌ Erreur deleteCategory:', error);
    res.status(500).json({ status: 'fail', message: 'Erreur serveur' });
  }
};

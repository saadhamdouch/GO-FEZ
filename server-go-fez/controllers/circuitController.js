const { Circuit, Theme, POI, ThemeCircuit, CircuitPOI, City } = require('../models');
const xss = require('xss');

 // Créer un circuit avec ses relations (thèmes + POIs)

exports.createCircuitWithRelations = async (req, res) => {
  try {
    const {
      ar,
      fr,
      en,
      themeId,
      cityId,
      duration,
      distance,
      startPoint,
      endPoint,
      isActive,
      isPremium,
      price,
      rating,
      reviewCount,
      pois
    } = req.body;

    const sanitizedData = {
      ar: xss(ar),
      fr: xss(fr),
      en: xss(en),
      duration: duration ? Number(duration) : null,
      distance: distance ? Number(distance) : null,
      startPoint: null,
      endPoint: null,
      isPremium: isPremium === 'true' || isPremium === true,
      price: price ? Number(price) : null,
      rating: rating ? Number(rating) : 0,
      reviewCount: reviewCount ? Number(reviewCount) : 0,
      cityId,
      themeId,
      isActive: isActive === 'true' || isActive === true,
      isDeleted: false
    };

    // Sécurisation du parsing JSON
    try {
      sanitizedData.startPoint = startPoint ? JSON.parse(startPoint) : null;
    } catch {
      sanitizedData.startPoint = null;
    }

    try {
      sanitizedData.endPoint = endPoint ? JSON.parse(endPoint) : null;
    } catch {
      sanitizedData.endPoint = null;
    }

    // TODO: upload image vers Cloudinary (plus tard)
    const urlImage = "https://example.com";
    sanitizedData.image = urlImage;

    //  Création du circuit
    const circuit = await Circuit.create(sanitizedData);

    //  Liaison des thèmes (table pivot ThemeCircuit)
     if (themeId && themeId.length > 0) {
       await circuit.setThemes(themeId);
     }

    //  Liaison des POIs (table pivot CircuitPOI)
    if (pois && pois.length > 0) {
      for (const poiItem of pois) {
        await CircuitPOI.create({
          circuitId: circuit.id,
          poiId: poiItem.poiId,
          order: poiItem.order || null,
          estimatedTime: poiItem.estimatedTime || null
        });
      }
    }

    //  Récupération du circuit complet avec ses relations
    const circuitWithRelations = await Circuit.findByPk(circuit.id, {
      include: [
        { model: City, as: 'city' },
        { model: Theme, as: 'themes', through: { attributes: [] } },
        { model: POI, as: 'pois' }
      ]
    });

    return res.status(201).json({ status: 'success', data: circuitWithRelations });
  } catch (error) {
    console.error('❌ Erreur création circuit :', error);
    return res.status(500).json({ status: 'error', message: 'Erreur serveur', error });
  }
};

 // Récupérer tous les circuits

exports.getAllCircuits = async (req, res) => {
  try {
    const circuits = await Circuit.findAll({
      where: { isDeleted: false },
      include: [
        { model: City, as: 'city' },
        { model: Theme, as: 'themes', through: ThemeCircuit },
        { model: POI, as: 'pois' }
      ]
    });

    return res.status(200).json({ status: 'success', data: circuits });
  } catch (error) {
    console.error('❌ Erreur récupération circuits :', error);
    return res.status(500).json({ status: 'error', message: 'Erreur serveur', error });
  }
};


// Récupérer un circuit par ID

exports.getCircuitById = async (req, res) => {
  try {
    const { id } = req.params;
    const circuit = await Circuit.findOne({
      where: { id, isDeleted: false },
      include: [
        { model: City, as: 'city' },
        { model: Theme, as: 'themes', through: ThemeCircuit },
        { model: POI, as: 'pois' }
      ]
    });

    if (!circuit)
      return res.status(404).json({ status: 'fail', message: 'Circuit non trouvé' });

    return res.status(200).json({ status: 'success', data: circuit });
  } catch (error) {
    console.error('❌ Erreur récupération circuit :', error);
    return res.status(500).json({ status: 'error', message: 'Erreur serveur', error });
  }
};

// Mettre à jour un circuit (et ses relations)
exports.updateCircuit = async (req, res) => {
  try {
    const { id } = req.params;
    const { themeId, pois, ...circuitData } = req.body;

    const circuit = await Circuit.findByPk(id);
    if (!circuit || circuit.isDeleted)
      return res.status(404).json({ status: 'fail', message: 'Circuit non trouvé' });

    const sanitizedData = {};

    if (circuitData.ar) sanitizedData.ar = xss(circuitData.ar);
    if (circuitData.fr) sanitizedData.fr = xss(circuitData.fr);
    if (circuitData.en) sanitizedData.en = xss(circuitData.en);
    if (circuitData.duration) sanitizedData.duration = Number(circuitData.duration);
    if (circuitData.distance) sanitizedData.distance = Number(circuitData.distance);

    try {
      if (circuitData.startPoint)
        sanitizedData.startPoint = JSON.parse(circuitData.startPoint);
      if (circuitData.endPoint)
        sanitizedData.endPoint = JSON.parse(circuitData.endPoint);
    } catch {
      sanitizedData.startPoint = null;
      sanitizedData.endPoint = null;
    }

    if (circuitData.isPremium !== undefined)
      sanitizedData.isPremium = circuitData.isPremium === 'true' || circuitData.isPremium === true;
    if (circuitData.price) sanitizedData.price = Number(circuitData.price);
    if (circuitData.rating) sanitizedData.rating = Number(circuitData.rating);
    if (circuitData.reviewCount) sanitizedData.reviewCount = Number(circuitData.reviewCount);
    if (circuitData.cityId) sanitizedData.cityId = circuitData.cityId;
    if (circuitData.isActive !== undefined)
      sanitizedData.isActive = circuitData.isActive === 'true' || circuitData.isActive === true;

    if (req.file) {
      const urlImage = "https://example.com"; 
      sanitizedData.image = urlImage;
    }

    await circuit.update(sanitizedData);

    // Mettre à jour les relations
    if (themeId) await circuit.setThemes(themeId);

    if (pois && pois.length > 0) {
      await CircuitPOI.destroy({ where: { circuitId: id } });
      for (const poiItem of pois) {
        await CircuitPOI.create({
          circuitId: id,
          poiId: poiItem.poiId,
          order: poiItem.order || null,
          estimatedTime: poiItem.estimatedTime || null
        });
      }
    }

    const updatedCircuit = await Circuit.findByPk(id, {
      include: [
        { model: City, as: 'city' },
        { model: Theme, as: 'themes', through: ThemeCircuit },
        { model: POI, as: 'pois' }
      ]
    });

    return res.status(200).json({ status: 'success', data: updatedCircuit });
  } catch (error) {
    console.error('❌ Erreur mise à jour circuit :', error);
    return res.status(500).json({ status: 'error', message: 'Erreur serveur', error });
  }
};

// Suppression logique d’un circuit
exports.deleteCircuit = async (req, res) => {
  try {
    const { id } = req.params;
    const circuit = await Circuit.findByPk(id);

    if (!circuit || circuit.isDeleted)
      return res.status(404).json({ status: 'fail', message: 'Circuit non trouvé' });

    await circuit.update({ isDeleted: true });
    return res.status(200).json({ status: 'success', message: 'Circuit supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression circuit :', error);
    return res.status(500).json({ status: 'error', message: 'Erreur serveur', error });
  }
};

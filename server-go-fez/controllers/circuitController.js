const { Circuit, Theme, POI, ThemeCircuit, CircuitPOI, City } = require('../models');
const xss = require('xss');
const { uploadImage, deleteFile } = require("../config/cloudinary");


// Créer un circuit avec upload d'image
exports.createCircuitWithImage = async (req, res) => {
  try {
    console.log('📁 Fichier image reçu:', req.file ? req.file.originalname : 'Aucun');
    
    const { data } = req.body;
    const circuitData = JSON.parse(data);
    
    const {
      cityId,
      duration,
      distance,
      startPoint,
      endPoint,
      isActive,
      isPremium,
      themeIds,
      poiIds,
      localizations
    } = circuitData;
//ajouter xss aux localisations

    const sanitizedData = {
      ar:  localizations.ar,
      fr: localizations.fr,
      en: localizations.en,
      duration: duration ? Number(duration) : null,
      distance: distance ? Number(distance) : null,
      startPoint: null,
      endPoint: null,
      isPremium: isPremium === 'true' || isPremium === true,
      price: null,
      rating: 0,
      reviewCount: 0,
      cityId,
      isActive: isActive === 'true' || isActive === true,
      isDeleted: false,
      image: req.file ? req.file.path : null, // URL
      imagePublicId: req.file ? req.file.filename : null // Public ID

    };

   
    console.log('🏗️ Création du circuit avec les données:', sanitizedData);

    // Création du circuit
    const circuit = await Circuit.create(sanitizedData);

    // Liaison des thèmes
    if (themeIds && themeIds.length > 0) {
      await circuit.setThemes(themeIds);
    }

    // Liaison des POIs
    if (poiIds && poiIds.length > 0) {
      for (let i = 0; i < poiIds.length; i++) {
        await CircuitPOI.create({
          circuitId: circuit.id,
          poiId: poiIds[i],
          order: i + 1,
          estimatedTime: null
        });
      }
    }

    // Récupération du circuit complet avec ses relations
    const circuitWithRelations = await Circuit.findByPk(circuit.id, {
      include: [
        { model: City, as: 'city' },
        { model: Theme, as: 'themes', through: { attributes: [] } },
        { model: POI, as: 'pois' }
      ]
    });

    return res.status(201).json({ 
      success: true,
      message: 'Circuit créé avec succès',
      data: circuitWithRelations 
    });
  } catch (error) {
    console.error('❌ Erreur création circuit avec image:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      error: error.message 
    });
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
        let circuitData = req.body;
        let themeIds = req.body.themeId; // Initialisation à partir du body direct
        let pois = req.body.pois; // Initialisation à partir du body direct

        //  1. Déterminer la source des données : req.body.data pour le Frontend (FormData)
        if (req.body.data) {
            try {
                // Le Frontend envoie toutes les données non-fichier dans une chaîne JSON appelée 'data'
                const parsedData = JSON.parse(req.body.data);
                
                // Extraire les relations et les données principales
                themeIds = parsedData.themeIds || parsedData.themeId; // Gérer les deux noms possibles
                pois = parsedData.pois;
                
                // Le reste des données (localizations, duration, distance, etc.)
                circuitData = parsedData;

            } catch (e) {
                console.error("Erreur de parsing JSON dans req.body.data:", e);
                return res.status(400).json({ status: 'error', message: 'Format de données invalide (JSON manquant ou mal formé).' });
            }
        }
        
        // --- Vérifications et Initialisation ---
        
        const circuit = await Circuit.findByPk(id);
        if (!circuit || circuit.isDeleted)
            return res.status(404).json({ status: 'fail', message: 'Circuit non trouvé' });

        const sanitizedData = {};
        
        // 2. Gérer les Localisations (ar, fr, en)
        // Les données des localisations sont des objets qui doivent être stringifiés
        if (circuitData.localizations) {
            if (circuitData.localizations.ar) {
                sanitizedData.ar = JSON.stringify({ 
                    name: xss(circuitData.localizations.ar.name || ''),
                    description: xss(circuitData.localizations.ar.description || '')
                });
            }
            if (circuitData.localizations.fr) {
                sanitizedData.fr = JSON.stringify({ 
                    name: xss(circuitData.localizations.fr.name || ''),
                    description: xss(circuitData.localizations.fr.description || '')
                });
            }
            if (circuitData.localizations.en) {
                sanitizedData.en = JSON.stringify({ 
                    name: xss(circuitData.localizations.en.name || ''),
                    description: xss(circuitData.localizations.en.description || '')
                });
            }
        } 
        else {
             if (circuitData.ar) sanitizedData.ar = xss(circuitData.ar);
             if (circuitData.fr) sanitizedData.fr = xss(circuitData.fr);
             if (circuitData.en) sanitizedData.en = xss(circuitData.en);
        }
        
        //  3. Gérer les autres champs
        if (circuitData.duration !== undefined) sanitizedData.duration = circuitData.duration ? Number(circuitData.duration) : null;
        if (circuitData.distance !== undefined) sanitizedData.distance = circuitData.distance ? Number(circuitData.distance) : null;
        
        sanitizedData.startPoint = circuitData.startPoint ? xss(circuitData.startPoint) : null;
        sanitizedData.endPoint = circuitData.endPoint ? xss(circuitData.endPoint) : null; 
        
        if (circuitData.isPremium !== undefined)
          sanitizedData.isPremium = circuitData.isPremium === 'true' || circuitData.isPremium === true;
        if (circuitData.price !== undefined) sanitizedData.price = circuitData.price ? Number(circuitData.price) : null;
        if (circuitData.rating !== undefined) sanitizedData.rating = circuitData.rating ? Number(circuitData.rating) : null;
        if (circuitData.reviewCount !== undefined) sanitizedData.reviewCount = circuitData.reviewCount ? Number(circuitData.reviewCount) : 0;
        if (circuitData.cityId) sanitizedData.cityId = circuitData.cityId;
        if (circuitData.isActive !== undefined)
          sanitizedData.isActive = circuitData.isActive === 'true' || circuitData.isActive === true;

        //  4. Gérer l'upload de l'image si présente (même logique que l'original)
        if (req.file) {
            if (circuit.imagePublicId) { 
                console.log(`🗑️ Suppression image Cloudinary ancienne: ${circuit.imagePublicId}`);
                await deleteFile(circuit.imagePublicId);
            }
            sanitizedData.image = req.file.path; 
            sanitizedData.imagePublicId = req.file.filename; 
        }

        // --- Mise à jour de la base de données ---
        
        await circuit.update(sanitizedData);

        //  5. Mettre à jour les relations
        
        // Thèmes : Attendu comme un tableau d'IDs
        if (themeIds && themeIds.length > 0) {
            // S'assurer que themeIds est un tableau d'IDs (pas d'objets)
            const finalThemeIds = themeIds.map(t => (typeof t === 'object' && t !== null) ? t.id : t).filter(Boolean);
            await circuit.setThemes(finalThemeIds);
        } else if (themeIds && themeIds.length === 0) {
            // Si le tableau est vide, dissocier tous les thèmes
             await circuit.setThemes([]);
        }
        
        // POIs : Attendu comme un tableau d'objets (pour gérer order et estimatedTime)
        if (pois && pois.length > 0) {
            await CircuitPOI.destroy({ where: { circuitId: id } }); // Suppression complète des anciennes liaisons
            
            for (const poiItem of pois) {
                //  Correction du bug : On s'assure d'avoir l'ID soit directement, soit via poiItem.id
                const poiId = poiItem.poiId || poiItem.id; 
                
                if (poiId) {
                    await CircuitPOI.create({
                        circuitId: id,
                        poiId: poiId,
                        order: poiItem.order ? Number(poiItem.order) : null,
                        estimatedTime: poiItem.estimatedTime ? Number(poiItem.estimatedTime) : null
                    });
                }
            }
        } else if (pois && pois.length === 0) {
             // Si le tableau est vide, supprimer toutes les liaisons POI
             await CircuitPOI.destroy({ where: { circuitId: id } });
        }


        // Récupération du circuit mis à jour
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
        // Gestion d'erreur: Supprimer la nouvelle image si l'opération DB échoue
        if (req.file) {
            console.log(` Suppression de l'image uploadée suite à une erreur: ${req.file.filename}`);
            await deleteFile(req.file.filename);
        }
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

    if (circuit.imagePublicId) {
   console.log(` Suppression image Cloudinary: ${circuit.imagePublicId}`);
   await deleteFile(circuit.imagePublicId);
  }

    await circuit.update({ isDeleted: true });
    return res.status(200).json({ status: 'success', message: 'Circuit supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression circuit :', error);
    return res.status(500).json({ status: 'error', message: 'Erreur serveur', error });
  }
};

const { validationResult } = require('express-validator');
const { Op, Sequelize } = require('sequelize');
const logger = require('../Config/logger');
const { POI, POILocalization, POIFile, City, Category, User, UserSpace, TransportMode } = require('../models');
const EARTH_RADIUS_KM = 6371;
const { uploadFromBuffer, deleteFile, uploadPoiFile, uploadMultiplePoiFiles } = require('../Config/cloudinary');
const xss = require('xss');

// Middleware pour vérifier les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Erreurs de validation",
      errors: errors.array(),
    });
  }
  next();
};

// Méthode pour créer un POI avec upload de fichiers
const createPOIWithFiles = async (req, res) => {
  try {

    const {
      coordinates,
      category,
      practicalInfo,
      cityId,
      isActive = true,
      isVerified = false,
      isPremium = false,
      arLocalization,
      frLocalization,
      enLocalization
    } = req.body;

    // Parser les localisations JSON
    const arLoc = arLocalization ? JSON.parse(arLocalization) : null;
    const frLoc = frLocalization ? JSON.parse(frLocalization) : null;
    const enLoc = enLocalization ? JSON.parse(enLocalization) : null;

    // Validation: Au moins une localisation doit avoir un nom
    if (!arLoc?.name && !frLoc?.name && !enLoc?.name) {
      return res.status(400).json({
        success: false,
        message: 'Au moins un nom de localisation est requis'
      });
    }

    // 1. Créer les localisations avec les fichiers audio uploadés
    let arLocalizationResponse = null;
    let frLocalizationResponse = null;
    let enLocalizationResponse = null;

    // Créer la localisation arabe
    if (arLoc && arLoc.name) {
      let arabicAudioUrl = null;
      if (req.files?.ar_audio) {
        try {
            console.log('📥 [FR AUDIO] File received:', {
    originalname: req.files.fr_audio[0].originalname,
    mimetype: req.files.fr_audio[0].mimetype,
    size: req.files.fr_audio[0].size,
    bufferType: typeof req.files.fr_audio[0].buffer,
    bufferLength: req.files.fr_audio[0].buffer?.length,
  });
          const audioResult = await uploadFromBuffer(
            req.files.ar_audio[0].buffer,
            'go-fez/audio/arabic',
            { resource_type: 'video' }
          );
          arabicAudioUrl = audioResult.secure_url;
          console.log('✅ [FR AUDIO UPLOADED] Cloudinary result url:', arabicAudioUrl);
          console.log('✅ [FR AUDIO UPLOADED] Cloudinary result:', audioResult);

        } catch (error) {
          console.warn('⚠️ Erreur upload audio arabe:', error.message);
        }
      }
      arLocalizationResponse = await POILocalization.create({
        name: xss(arLoc.name),
        description: arLoc.description ? xss(arLoc.description) : null,
        address: arLoc.address ? xss(arLoc.address) : null,
        audioFiles: arabicAudioUrl ? JSON.stringify([arabicAudioUrl]) : null
      });
    }

    // Créer la localisation française
    if (frLoc && frLoc.name) {
      let frenchAudioUrl = null;
      if (req.files?.fr_audio) {
        try {
          const audioResult = await uploadFromBuffer(
            req.files.fr_audio[0].buffer,
            'go-fez/audio/french',
            { resource_type: 'video' }
          );
          frenchAudioUrl = audioResult.secure_url;
        } catch (error) {
          console.warn('⚠️ Erreur upload audio français:', error.message);
        }
      }
      frLocalizationResponse = await POILocalization.create({
        name: xss(frLoc.name),
        description: frLoc.description ? xss(frLoc.description) : null,
        address: frLoc.address ? xss(frLoc.address) : null,
        audioFiles: frenchAudioUrl ? JSON.stringify([frenchAudioUrl]) : null
      });
    }

    // Créer la localisation anglaise
    if (enLoc && enLoc.name) {
      let englishAudioUrl = null;
      if (req.files?.en_audio) {
        try {
          const audioResult = await uploadFromBuffer(
            req.files.en_audio[0].buffer,
            'go-fez/audio/english',
            { resource_type: 'video' }
          );
          englishAudioUrl = audioResult.secure_url;
        } catch (error) {
          console.warn('⚠️ Erreur upload audio anglais:', error.message);
        }
      }
      enLocalizationResponse = await POILocalization.create({
        name: xss(enLoc.name),
        description: enLoc.description ? xss(enLoc.description) : null,
        address: enLoc.address ? xss(enLoc.address) : null,
        audioFiles: englishAudioUrl ? JSON.stringify([englishAudioUrl]) : null
      });
    }

    // 2. Créer le POI principal d'abord pour obtenir son ID
    const parsedCoordinates = JSON.parse(coordinates);
    const poiData = {
      ar: arLocalizationResponse?.id || null,
      fr: frLocalizationResponse?.id || null,
      en: enLocalizationResponse?.id || null,
      coordinates: parsedCoordinates,
      category: category,
      practicalInfo: practicalInfo ? JSON.parse(practicalInfo) : null,
      cityId: cityId,
      isActive: isActive === 'true' || isActive === true,
      isVerified: isVerified === 'true' || isVerified === true,
      isPremium: isPremium === 'true' || isPremium === true
    };

    
    // Créer le POI d'abord pour obtenir son ID
    const poiResponse = await POI.create(poiData);

    // 3. Maintenant créer les POIFiles avec le poiId du POI créé
    // Upload et création POIFiles pour les images (plusieurs fichiers en une fois)
    if (req.files?.image && req.files.image.length > 0) {
      try {
        const uploadResults = await uploadMultiplePoiFiles(req.files.image, 'image');
        for (const result of uploadResults) {
          await POIFile.create({
            poiId: poiResponse.id,
            fileUrl: result.fileUrl,
            filePublicId: result.filePublicId,
            type: 'image'
          });
        }
      } catch (error) {
      }
    }

    // Upload et création POIFiles pour les vidéos (plusieurs fichiers en une fois)
    if (req.files?.video && req.files.video.length > 0) {
      try {
        const uploadResults = await uploadMultiplePoiFiles(req.files.video, 'video');
        for (const result of uploadResults) {
          await POIFile.create({
            poiId: poiResponse.id,
            fileUrl: result.fileUrl,
            filePublicId: result.filePublicId,
            type: 'video'
          });
        }
      } catch (error) {
      }
    }

    // Créer POIFile pour le lien de visite virtuelle (si fourni)
    const { virtualTourUrl } = req.body;
    if (virtualTourUrl && virtualTourUrl.trim()) {
      try {
        await POIFile.create({
          poiId: poiResponse.id,
          fileUrl: virtualTourUrl.trim(),
          filePublicId: null,
          type: 'virtualtour'
        });
      } catch (error) {
      }
    }

    // Récupérer le POI complet avec ses relations
    const poiWithRelations = await POI.findByPk(poiResponse.id, {
      include: [
        { model: POILocalization, as: 'frLocalization' },
        { model: POILocalization, as: 'arLocalization' },
        { model: POILocalization, as: 'enLocalization' },
        { model: Category, as: 'categoryPOI' },
        { model: POIFile, as: 'files' },
        { model: City, as: 'city' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'POI créé avec succès avec fichiers',
      data: poiWithRelations
    });
  } catch (error) {
    console.error("Erreur lors de la création du POI avec fichiers:", error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Méthode pour récupérer tous les POI
const findAllPOIs = async (req, res) => {
  try {
    const pois = await POI.findAll({
      where: { isDeleted: false },
      include: [
        { model: POILocalization, as: 'frLocalization' },
        { model: POILocalization, as: 'arLocalization' },
        { model: POILocalization, as: 'enLocalization' },
        { model: Category, as: 'categoryPOI', attributes: ['id', 'fr', 'ar', 'en'] },
        { model: POIFile, as: 'files' },
        { model: City, as: 'city', attributes: ['id', 'name', 'nameAr', 'nameEn'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: "POI récupérés avec succès",
      pois: pois,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des POI:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};

// Méthode pour récupérer un POI par ID
const findOnePOI = async (req, res) => {
  try {
    const { id } = req.params;

    const poi = await POI.findOne({
      where: { id, isDeleted: false },
      include: [
        { model: POILocalization, as: 'frLocalization' },
        { model: POILocalization, as: 'arLocalization' },
        { model: POILocalization, as: 'enLocalization' },
        { model: Category, as: 'categoryPOI' },
        { model: POIFile, as: 'files' },
        { model: City, as: 'city' }
      ]
    });

    if (!poi) {
      return res.status(404).json({
        success: false,
        message: "POI non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      poi: poi,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du POI:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};

// Méthode pour mettre à jour un POI
const updatePOI = async (req, res) => {
  try {
    const { id } = req.params;

    const poi = await POI.findOne({
      where: { id, isDeleted: false },
      include: [
        { model: POILocalization, as: 'frLocalization' },
        { model: POILocalization, as: 'arLocalization' },
        { model: POILocalization, as: 'enLocalization' },
        { model: POIFile, as: 'files' }
      ]
    });

    if (!poi) {
      return res.status(404).json({
        success: false,
        message: "POI non trouvé",
      });
    }

    let poiData = req.body;
    let arLoc, frLoc, enLoc;

    if (req.body.data) {
      try {
        poiData = JSON.parse(req.body.data);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Format de données invalide'
        });
      }
    }

    if (poiData.arLocalization) {
      arLoc = typeof poiData.arLocalization === 'string'
        ? JSON.parse(poiData.arLocalization)
        : poiData.arLocalization;
    }
    if (poiData.frLocalization) {
      frLoc = typeof poiData.frLocalization === 'string'
        ? JSON.parse(poiData.frLocalization)
        : poiData.frLocalization;
    }
    if (poiData.enLocalization) {
      enLoc = typeof poiData.enLocalization === 'string'
        ? JSON.parse(poiData.enLocalization)
        : poiData.enLocalization;
    }

    if (arLoc && poi.arLocalization) {
      await poi.arLocalization.update({
        name: arLoc.name ? xss(arLoc.name) : poi.arLocalization.name,
        description: arLoc.description ? xss(arLoc.description) : poi.arLocalization.description,
        address: arLoc.address ? xss(arLoc.address) : poi.arLocalization.address
      });

      if (req.files?.ar_audio) {
        try {
          const audioResult = await uploadFromBuffer(
            req.files.ar_audio[0].buffer,
            'go-fez/audio/arabic',
            { resource_type: 'video' }
          );
          await poi.arLocalization.update({
            audioFiles: JSON.stringify([audioResult.secure_url])
          });
        } catch (error) {
          console.warn('⚠️ Erreur upload audio arabe:', error.message);
        }
      }
    }

    if (frLoc && poi.frLocalization) {
      await poi.frLocalization.update({
        name: frLoc.name ? xss(frLoc.name) : poi.frLocalization.name,
        description: frLoc.description ? xss(frLoc.description) : poi.frLocalization.description,
        address: frLoc.address ? xss(frLoc.address) : poi.frLocalization.address
      });

      if (req.files?.fr_audio) {
        try {
          const audioResult = await uploadFromBuffer(
            req.files.fr_audio[0].buffer,
            'go-fez/audio/french',
            { resource_type: 'video' }
          );
          await poi.frLocalization.update({
            audioFiles: JSON.stringify([audioResult.secure_url])
          });
        } catch (error) {
          console.warn('⚠️ Erreur upload audio français:', error.message);
        }
      }
    }

    if (enLoc && poi.enLocalization) {
      await poi.enLocalization.update({
        name: enLoc.name ? xss(enLoc.name) : poi.enLocalization.name,
        description: enLoc.description ? xss(enLoc.description) : poi.enLocalization.description,
        address: enLoc.address ? xss(enLoc.address) : poi.enLocalization.address
      });

      if (req.files?.en_audio) {
        try {
          const audioResult = await uploadFromBuffer(
            req.files.en_audio[0].buffer,
            'go-fez/audio/english',
            { resource_type: 'video' }
          );
          await poi.enLocalization.update({
            audioFiles: JSON.stringify([audioResult.secure_url])
          });
        } catch (error) {
          console.warn('⚠️ Erreur upload audio anglais:', error.message);
        }
      }
    }

    if (req.files?.image && req.files.image.length > 0) {
      try {
        const uploadResults = await uploadMultiplePoiFiles(req.files.image, 'image');
        for (const result of uploadResults) {
          await POIFile.create({
            poiId: poi.id,
            fileUrl: result.fileUrl,
            filePublicId: result.filePublicId,
            type: 'image'
          });
        }
      } catch (error) {}
    }

    if (req.files?.video && req.files.video.length > 0) {
      try {
        const uploadResults = await uploadMultiplePoiFiles(req.files.video, 'video');
        for (const result of uploadResults) {
          await POIFile.create({
            poiId: poi.id,
            fileUrl: result.fileUrl,
            filePublicId: result.filePublicId,
            type: 'video'
          });
        }
      } catch (error) {}
    }

    const { virtualTourUrl } = req.body;
    if (virtualTourUrl) {
      const existingVirtualTour = await POIFile.findOne({
        where: { poiId: poi.id, type: 'virtualtour' }
      });

      if (existingVirtualTour) {
        await existingVirtualTour.update({ fileUrl: virtualTourUrl });
      } else {
        await POIFile.create({
          poiId: poi.id,
          fileUrl: virtualTourUrl,
          filePublicId: null,
          type: 'virtualtour'
        });
      }
    }

if (poiData.filesToRemove) {
      try {
        // 1. D'ABORD, parser la chaîne venant du FormData
        const fileIdsToRemove = typeof poiData.filesToRemove === 'string'
          ? JSON.parse(poiData.filesToRemove)
          : poiData.filesToRemove;

        // 2. ENSUITE, vérifier si c'est un tableau
        if (Array.isArray(fileIdsToRemove)) {
          console.log('🔄 Fichiers à supprimer:', fileIdsToRemove); // <-- Vous verrez ce log maintenant

          for (const fileId of fileIdsToRemove) {
            try {
              // 3. Trouver l'enregistrement du fichier par son ID (UUID)
              const fileToDestroy = await POIFile.findOne({ where: { id: fileId } });

              if (fileToDestroy) {
                // 4. S'il a un filePublicId, le supprimer de Cloudinary
                if (fileToDestroy.filePublicId) {
                  await deleteFile(fileToDestroy.filePublicId);
                  console.log('🗑️ Fichier supprimé de Cloudinary:', fileToDestroy.filePublicId);
                }
                
                // 5. Détruire l'enregistrement dans la base de données
                await fileToDestroy.destroy();
                console.log('🗑️ Enregistrement fichier supprimé de la DB:', fileId);

              } else {
                console.warn('⚠️ Fichier à supprimer non trouvé (ID):', fileId);
              }
            } catch (err) {
              console.warn(`⚠️ Erreur lors de la suppression du fichier (ID: ${fileId}):`, err.message);
            }
          }
        }
      } catch (err) {
        console.warn('⚠️ Erreur lors du parsing ou du traitement de filesToRemove:', err.message);
      }
    }

    const updateData = {};
    if (poiData.coordinates) {
      updateData.coordinates = typeof poiData.coordinates === 'string'
        ? JSON.parse(poiData.coordinates)
        : poiData.coordinates;
    }
    if (poiData.category) updateData.category = poiData.category;
    if (poiData.practicalInfo) {
      updateData.practicalInfo = typeof poiData.practicalInfo === 'string'
        ? JSON.parse(poiData.practicalInfo)
        : poiData.practicalInfo;
    }
    if (poiData.cityId) updateData.cityId = poiData.cityId;
    if (poiData.isActive !== undefined) {
      updateData.isActive = poiData.isActive === 'true' || poiData.isActive === true;
    }
    if (poiData.isVerified !== undefined) {
      updateData.isVerified = poiData.isVerified === 'true' || poiData.isVerified === true;
    }
    if (poiData.isPremium !== undefined) {
      updateData.isPremium = poiData.isPremium === 'true' || poiData.isPremium === true;
    }

    await poi.update(updateData);

    const updatedPOI = await POI.findByPk(id, {
      include: [
        { model: POILocalization, as: 'frLocalization' },
        { model: POILocalization, as: 'arLocalization' },
        { model: POILocalization, as: 'enLocalization' },
        { model: Category, as: 'categoryPOI' },
        { model: POIFile, as: 'files' },
        { model: City, as: 'city' }
      ]
    });

    res.status(200).json({
      success: true,
      message: "POI mis à jour avec succès",
      data: updatedPOI
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du POI:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Méthode pour supprimer un POI (suppression logique)
const deletePOI = async (req, res) => {
  try {
    const { id } = req.params;

    const poi = await POI.findOne({
      where: { id, isDeleted: false },
      include: [{ model: POIFile, as: 'files' }]
    });

    if (!poi) {
      return res.status(404).json({
        success: false,
        message: "POI non trouvé",
      });
    }

    // Supprimer les fichiers Cloudinary avant la suppression logique
    if (poi.files && poi.files.length > 0) {
      for (const file of poi.files) {
        if (file.filePublicId) {
          await deleteFile(file.filePublicId).catch(err =>
            console.warn('⚠️ Erreur suppression fichier:', err)
          );
        }
      }
    }

    // Suppression logique
    await poi.update({ isDeleted: true });

    res.status(200).json({
      success: true,
      message: "POI supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du POI:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};

// Méthode pour récupérer les POIs pour le Parcours Libre

const getPOIsForParcoursLibre = async (req, res) => {
  const { latitude, longitude, mode } = req.query;

  // 1. Validation de base
  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: "Les paramètres géographiques (latitude, longitude) sont requis."
    });
  }

  try {
    const targetLat = parseFloat(latitude);
    const targetLon = parseFloat(longitude);

    // 1. Définir une durée de référence (ex: 10 minutes en heures)
    const referenceTimeHours = 10 / 60;

    let modeKey = mode || 'walk'; // Par défaut : 'walk' si non spécifié
    let maxDistanceKm = 5.0; // Rayon par défaut de secours

    // 2. Chercher la vitesse moyenne du mode de transport
    const transportMode = await TransportMode.findOne({
      where: { modeKey: modeKey },
      attributes: ['averageSpeedKmH']
    });

    if (transportMode && transportMode.averageSpeedKmH) {
      const speed = transportMode.averageSpeedKmH;
      // Distance = Vitesse (km/h) * Temps (heures)
      maxDistanceKm = speed * referenceTimeHours;

      // On s'assure qu'on ne dépasse pas une limite raisonnable (ex: 15 km)
      if (maxDistanceKm > 15) {
        maxDistanceKm = 15.0;
      }
    }

    // 2. Construction de la formule Haversine pour calculer la distance
    const POI_LAT = 'JSON_EXTRACT(POI.coordinates, "$.latitude")';
    const POI_LON = 'JSON_EXTRACT(POI.coordinates, "$.longitude")';

    const distanceLiteral = `(
            ${EARTH_RADIUS_KM} * acos(
                cos( radians(:targetLat) ) * cos( radians(${POI_LAT}) ) * cos( radians(${POI_LON}) - radians(:targetLon) )
                + sin( radians(:targetLat) ) * sin( radians(${POI_LAT}) )
            )
        )`;

    // 3. Conditions WHERE (filtrage par distance uniquement)
    const whereCondition = {
      isDeleted: false,
      isActive: true
    };

    const distanceWhere = Sequelize.where(Sequelize.literal(distanceLiteral), {
      [Op.lte]: maxDistanceKm
    });

    whereCondition[Op.and] = [distanceWhere];

    // 4. Exécution de la requête
    let pois = await POI.findAll({
      attributes: [
        'id',
        'coordinates',
        'cityId',
        'category',
        [Sequelize.literal(distanceLiteral), 'distance_km']
      ],
      where: whereCondition,
      replacements: { targetLat, targetLon },
      include: [
        {
          model: POILocalization,
          as: 'frLocalization',
          attributes: ['name', 'description']
        },
        {
          model: Category,
          as: 'categoryPOI',
          attributes: ['id', 'fr', 'ar']
        },
        {
          model: UserSpace,
          as: 'spaceDetails',
          required: false,
          attributes: ['userId'],
          include: [
            {
              model: User,
              as: 'spaceOwner',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
              required: true
            }
          ]
        }
      ],
      order: [[Sequelize.literal('distance_km'), 'ASC']],
      raw: false,
      nest: true
    });

    // 5. Traitement des données : affichage conditionnel du propriétaire
    pois = pois.map(poi => {
      const plainPoi = poi.get({ plain: true });

      let ownerDetails = null;
      const spaceOwner = plainPoi.spaceDetails ? plainPoi.spaceDetails.spaceOwner : null;

      const isManaged = !!spaceOwner;

      if (isManaged) {
        ownerDetails = spaceOwner;
      }

      delete plainPoi.spaceDetails;

      return {
        ...plainPoi,
        infoProprietaire: ownerDetails
      };
    });

    // 6. Réponse finale
    res.status(200).json({
      success: true,
      message: `Parcours Libre exécuté avec succès. Rayon utilisé : ${maxDistanceKm.toFixed(2)} km. (Mode: ${modeKey}).`,
      count: pois.length,
      pois: pois
    });

  } catch (error) {
    console.error('❌ Erreur lors du parcours libre :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la recherche des points d’intérêt.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getTravelTime = async (req, res) => {

  const { distanceKm, mode } = req.query;

  if (!distanceKm || !mode) {
    return res.status(400).json({
      success: false,
      message: "Les paramètres 'distanceKm' et 'mode' sont requis."
    });
  }

  try {
    const distance = parseFloat(distanceKm);
    const modeKey = mode.toLowerCase();

    if (isNaN(distance) || distance <= 0) {
      return res.status(400).json({
        success: false,
        message: "Le paramètre 'distanceKm' doit être un nombre positif."
      });
    }

    const transportMode = await TransportMode.findOne({
      where: { modeKey: modeKey },
      attributes: ['averageSpeedKmH']
    });

    if (!transportMode || !transportMode.averageSpeedKmH) {
      return res.status(404).json({
        success: false,
        message: `Mode de transport inconnu ou non supporté : '${modeKey}'.`
      });
    }

    const speedKmH = transportMode.averageSpeedKmH;

    const travelTimeHours = distance / speedKmH;

    const travelTimeMinutes = travelTimeHours * 60;

    res.status(200).json({
      success: true,
      message: "Calcul du temps de trajet réussi.",
      mode: modeKey,
      speedKmH: speedKmH,
      distanceKm: parseFloat(distance.toFixed(2)),
      travelTimeMinutes: parseFloat(travelTimeMinutes.toFixed(2))
    });

  } catch (error) {
    console.error('❌ Erreur lors du calcul du temps de trajet :', error);
  }
};


module.exports = {
  handleValidationErrors,
  createPOIWithFiles,
  findAllPOIs,
  findOnePOI,
  updatePOI,
  deletePOI,
  getPOIsForParcoursLibre,
  getTravelTime
};
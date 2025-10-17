const { validationResult } = require('express-validator');
const { POI, POILocalization, POIFile } = require('../models');
const { 
    uploadFile,
    uploadFromBuffer,
    uploadMultipleFiles
 } = require('../Config/cloudinary');

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

// Méthode pour créer un POI
const createPOI = async (req, res) => {
    try {
        const {
            // Données principales du POI
            coordinates,
            category,
            practicalInfo,
            cityId,
            isActive = true,
            isVerified = false,
            isPremium = false,
            
            // Localisations multilingues
            arLocalization,
            frLocalization,
            enLocalization,
            
            // Fichiers multimédias
            poiFileData,
            audioFiles
        } = req.body;

        console.log('📝 Données reçues pour création POI:', {
            coordinates,
            category,
            cityId,
            hasLocalizations: !!(arLocalization || frLocalization || enLocalization),
            hasFiles: !!poiFileData,
            hasAudio: !!audioFiles
        });

        // 1. Créer les localisations (ar, fr, en) si fournies
        let arLocalizationResponse = null;
        let frLocalizationResponse = null;
        let enLocalizationResponse = null;

        // Créer la localisation arabe
        if (arLocalization && arLocalization.name) {
            let arabicAudioUrl = null;
            if (audioFiles && audioFiles.ar) {
                try {
                    // Simuler l'upload d'audio (dans un vrai cas, vous recevriez le fichier via multer)
                    arabicAudioUrl = `https://res.cloudinary.com/your-cloud/audio/arabic/${audioFiles.ar}`;
                } catch (error) {
                    console.warn('⚠️ Erreur upload audio arabe:', error.message);
                }
            }

            arLocalizationResponse = await POILocalization.create({
                name: arLocalization.name,
                description: arLocalization.description || null,
                address: arLocalization.address || null,
                audioFiles: arabicAudioUrl ? JSON.stringify([arabicAudioUrl]) : null
            });
        }

        // Créer la localisation française
        if (frLocalization && frLocalization.name) {
            let frenchAudioUrl = null;
            if (audioFiles && audioFiles.fr) {
                try {
                    frenchAudioUrl = `https://res.cloudinary.com/your-cloud/audio/french/${audioFiles.fr}`;
                } catch (error) {
                    console.warn('⚠️ Erreur upload audio français:', error.message);
                }
            }

            frLocalizationResponse = await POILocalization.create({
                name: frLocalization.name,
                description: frLocalization.description || null,
                address: frLocalization.address || null,
                audioFiles: frenchAudioUrl ? JSON.stringify([frenchAudioUrl]) : null
            });
        }

        // Créer la localisation anglaise
        if (enLocalization && enLocalization.name) {
            let englishAudioUrl = null;
            if (audioFiles && audioFiles.en) {
                try {
                    englishAudioUrl = `https://res.cloudinary.com/your-cloud/audio/english/${audioFiles.en}`;
                } catch (error) {
                    console.warn('⚠️ Erreur upload audio anglais:', error.message);
                }
            }

            enLocalizationResponse = await POILocalization.create({
                name: enLocalization.name,
                description: enLocalization.description || null,
                address: enLocalization.address || null,
                audioFiles: englishAudioUrl ? JSON.stringify([englishAudioUrl]) : null
            });
        }

        // 2. Créer le POIFile avec les URLs Cloudinary
        let poiFileResponse = null;
        if (poiFileData) {
            let imageUrl = null;
            let videoUrl = null;
            let virtualTourUrl = null;

            // Simuler les uploads (dans un vrai cas, vous recevriez les fichiers via multer)
            if (poiFileData.image) {
                imageUrl = `https://res.cloudinary.com/your-cloud/image/poi/${poiFileData.image}`;
            }
            if (poiFileData.video) {
                videoUrl = `https://res.cloudinary.com/your-cloud/video/poi/${poiFileData.video}`;
            }
            if (poiFileData.virtualTour360) {
                virtualTourUrl = `https://res.cloudinary.com/your-cloud/virtualTour/poi/${poiFileData.virtualTour360}`;
            }

            poiFileResponse = await POIFile.create({
            image: imageUrl,
            video: videoUrl,
            virtualTour360: virtualTourUrl
            });
        }

        // 3. Créer le POI principal avec toutes les relations
        const poiData = {
            ar: arLocalizationResponse?.id || null,
            fr: frLocalizationResponse?.id || null,
            en: enLocalizationResponse?.id || null,
            coordinates: coordinates,
            category: parseInt(category),
            practicalInfo: practicalInfo ? JSON.parse(practicalInfo) : null,
            cityId: cityId,
            isActive: isActive,
            isVerified: isVerified,
            isPremium: isPremium,
            poiFileId: poiFileResponse?.id || null
        };

        console.log('🏗️ Création du POI avec les données:', poiData);

        const poiResponse = await POI.create(poiData);

        // 4. Retourner le POI créé avec ses relations
        res.status(201).json({
            success: true,
            message: 'POI créé avec succès',
            data: {
                poi: poiResponse,
                localizations: {
                    ar: arLocalizationResponse,
                    fr: frLocalizationResponse,
                    en: enLocalizationResponse
                },
                files: poiFileResponse
            }
        });

    } catch (error) {
        console.error('❌ Erreur lors de la création du POI:', error);
        res.status(500).json({
                success: false,
            message: 'Erreur interne du serveur',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Méthode pour créer un POI avec upload de fichiers
const createPOIWithFiles = async (req, res) => {
    try {
        console.log('📁 Fichiers reçus:', {
            image: req.files?.image ? req.files.image[0].originalname : 'Aucun',
            fr_audio: req.files?.fr_audio ? req.files.fr_audio[0].originalname : 'Aucun',
            ar_audio: req.files?.ar_audio ? req.files.ar_audio[0].originalname : 'Aucun',
            en_audio: req.files?.en_audio ? req.files.en_audio[0].originalname : 'Aucun',
            video: req.files?.video ? req.files.video[0].originalname : 'Aucun',
            virtualTour360: req.files?.virtualTour360 ? req.files.virtualTour360[0].originalname : 'Aucun'
        });
        console.log('📁 Clés req.files:', Object.keys(req.files || {}));

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

        // 1. Créer les localisations avec les fichiers audio uploadés
        let arLocalizationResponse = null;
        let frLocalizationResponse = null;
        let enLocalizationResponse = null;

        // Parser les localisations JSON
        const arLoc = arLocalization ? JSON.parse(arLocalization) : null;
        const frLoc = frLocalization ? JSON.parse(frLocalization) : null;
        const enLoc = enLocalization ? JSON.parse(enLocalization) : null;

        // Créer la localisation arabe
        if (arLoc && arLoc.name) {
            let arabicAudioUrl = null;
            if (req.files?.ar_audio) {
                try {
                    const audioResult = await uploadFromBuffer(
                        req.files.ar_audio[0].buffer,
                        'go-fez/audio/arabic',
                        { resource_type: 'video' }
                    );
                    arabicAudioUrl = audioResult.secure_url;
                } catch (error) {
                    console.warn('⚠️ Erreur upload audio arabe:', error.message);
                }
            }

            arLocalizationResponse = await POILocalization.create({
                name: arLoc.name,
                description: arLoc.description || null,
                address: arLoc.address || null,
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
                name: frLoc.name,
                description: frLoc.description || null,
                address: frLoc.address || null,
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
                name: enLoc.name,
                description: enLoc.description || null,
                address: enLoc.address || null,
                audioFiles: englishAudioUrl ? JSON.stringify([englishAudioUrl]) : null
            });
        }

        // 2. Créer le POIFile avec les fichiers uploadés
        let poiFileResponse = null;
        if (req.files?.image || req.files?.video || req.files?.virtualTour360) {
            let imageUrl = null;
            let videoUrl = null;
            let virtualTourUrl = null;

            // Upload de l'image
            if (req.files?.image) {
                try {
                    const imageResult = await uploadFromBuffer(
                        req.files.image[0].buffer, 
                        'go-fez/images/poi'
                    );
                    imageUrl = imageResult.secure_url;
                } catch (error) {
                    console.warn('⚠️ Erreur upload image:', error.message);
                }
            }

            // Upload de la vidéo
            if (req.files?.video) {
                try {
                    const videoResult = await uploadFromBuffer(
                        req.files.video[0].buffer, 
                        'go-fez/videos/poi',
                        { resource_type: 'video' }
                    );
                    videoUrl = videoResult.secure_url;
                } catch (error) {
                    console.warn('⚠️ Erreur upload vidéo:', error.message);
                }
            }

            // Upload de la visite virtuelle 360°
            if (req.files?.virtualTour360) {
                try {
                    const vtFile = req.files.virtualTour360[0];
                    const isVideo = vtFile.mimetype.startsWith('video/');
                    const virtualTourResult = await uploadFromBuffer(
                        vtFile.buffer, 
                        'go-fez/virtual-tours/poi',
                        { resource_type: isVideo ? 'video' : 'image' }
                    );
                    virtualTourUrl = virtualTourResult.secure_url;
                } catch (error) {
                    console.warn('⚠️ Erreur upload visite virtuelle:', error.message);
                }
            }

            poiFileResponse = await POIFile.create({
                image: imageUrl,
                video: videoUrl,
                virtualTour360: virtualTourUrl
            });
        }

        // 3. Créer le POI principal
        const poiData = {
            ar: arLocalizationResponse?.id || null,
            fr: frLocalizationResponse?.id || null,
            en: enLocalizationResponse?.id || null,
            coordinates: JSON.parse(coordinates),
            category: parseInt(category),
            practicalInfo: practicalInfo ? JSON.parse(practicalInfo) : null,
            cityId: cityId,
            isActive: isActive === 'true' || isActive === true,
            isVerified: isVerified === 'true' || isVerified === true,
            isPremium: isPremium === 'true' || isPremium === true,
            poiFileId: poiFileResponse?.id || null
        };

        console.log('🏗️ Création du POI avec fichiers:', poiData);

        const poiResponse = await POI.create(poiData);

        res.status(201).json({
            success: true,
            message: 'POI créé avec succès avec fichiers',
            data: {
                poi: poiResponse,
                localizations: {
                    ar: arLocalizationResponse,
                    fr: frLocalizationResponse,
                    en: enLocalizationResponse
                },
                files: poiFileResponse
            }
        });

    } catch (error) {
        console.error('❌ Erreur lors de la création du POI avec fichiers:', error);
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
			where: {isDeleted: false},
			include: [
				{
					model: POILocalization,
					as: 'frLocalization',
					foreignKey: 'fr',
					targetKey: 'id'
				},
				{
					model: POILocalization,
					as: 'arLocalization',
					foreignKey: 'ar',
					targetKey: 'id'
				},
				{
					model: POILocalization,
					as: 'enLocalization',
					foreignKey: 'en',
					targetKey: 'id'
				}
			]
		});
        if (!pois) {
            return res.status(404).json({
                success: false,
                message: "Aucun POI trouvé",
            });
        }
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

		// TODO: Logique de récupération d'un POI par ID
		res.status(200).json({
			success: true,
			message: "Logique de récupération par ID à implémenter",
			poi: { id },
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

		// TODO: Logique de mise à jour du POI
		res.status(200).json({
			success: true,
			message: "POI mis à jour avec succès",
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour du POI:", error);
		res.status(500).json({
			success: false,
			message: "Erreur interne du serveur",
		});
	}
};

// Méthode pour supprimer un POI
const deletePOI = async (req, res) => {
	try {
		const { id } = req.params;

		// TODO: Logique de suppression du POI
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

module.exports = {
    handleValidationErrors,
    createPOI,
    createPOIWithFiles,
    findAllPOIs,
    findOnePOI,
    updatePOI,
    deletePOI
};

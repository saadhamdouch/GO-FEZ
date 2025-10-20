const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require("dotenv");

dotenv.config();

// Configuration Cloudinary avec gestion d'erreur
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Configuration Cloudinary initialisée');
} catch (configError) {
  console.error('❌ Erreur configuration Cloudinary:', configError);
}

// Configuration pour les images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'go-fez/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto:best', fetch_format: 'auto' }, // Compression AI optimale
      { flags: 'lossy' }, // Compression avec perte
      { bytes: 400000 } // Taille maximale de 400ko (400 * 1024 bytes)
    ]
  }
});

// Configuration pour les images de circuits
const circuitImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'go-fez/circuits',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto:best', fetch_format: 'auto' }, // Compression AI optimale
      { flags: 'lossy' }, // Compression avec perte
      { bytes: 400000 } // Taille maximale de 400ko (400 * 1024 bytes)
    ]
  }
});

// Configuration pour les images de Thèmes
// (utilise la même configuration que les images générales)
const themeImageStorage = new CloudinaryStorage({ 
  cloudinary: cloudinary,
  params: {
    folder: 'go-fez/themes',  
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [ 
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto:best', fetch_format: 'auto' }, // Compression AI optimale
      { flags: 'lossy' }, // Compression avec perte
      { bytes: 400000 } // Taille maximale de 400ko ( 400 * 1024 bytes)
    ]
  }
});   

// Configuration pour les fichiers audio
const audioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'go-fez/audio',
    resource_type: 'video', // Cloudinary traite les audio comme des vidéos
    allowed_formats: ['mp3', 'wav', 'ogg', 'm4a', 'aac'],
    transformation: [
      { audio_codec: 'mp3', audio_bitrate: '128k' }
    ]
  }
});

// Configuration pour les vidéos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'go-fez/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
    transformation: [
      { width: 1920, height: 1080, crop: 'limit' }
    ]
  }
});

// Configuration pour les visites virtuelles 360°
const virtualTourStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'go-fez/virtual-tours',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'webm'],
    transformation: [
      { width: 1920, height: 1080, crop: 'limit' }
    ]
  }
});

// Middlewares Multer
const uploadImage = multer({ 
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

const uploadCircuitImage = multer({ 
  storage: circuitImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

uploadThemeFiles = multer({
  storage: themeImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max per file           
});

const uploadAudio = multer({ 
  storage: audioStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

const uploadVideo = multer({ 
  storage: videoStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

const uploadVirtualTour = multer({ 
  storage: virtualTourStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});

// Fonctions utilitaires Cloudinary

const uploadFile = async (filePath, folder = "", options = {}) => {
  try {
    console.log('🔄 Upload fichier vers Cloudinary:', filePath);
    
    const defaultOptions = {
      folder,          // permet d'uploader dans un dossier Cloudinary spécifique
      resource_type: "auto", // gère image ou vidéo automatiquement
      ...options
    };
    
    const result = await cloudinary.uploader.upload(filePath, defaultOptions);
    console.log('✅ Fichier uploadé avec succès:', result.secure_url);
    return result;
  } catch (error) {
    console.error('❌ Erreur upload fichier:', error);
    throw new Error(`Erreur upload Cloudinary: ${error.message}`);
  }
};

const uploadFromBuffer = async (buffer, folder = "", options = {}) => {
  try {
    console.log('🔄 Upload buffer vers Cloudinary, taille:', buffer.length);
    
    const defaultOptions = {
      folder,
      resource_type: "auto",
      ...options
    };
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          if (error) {
            console.error('❌ Erreur upload stream:', error);
            reject(new Error(`Erreur upload Cloudinary: ${error.message}`));
          } else {
            console.log('✅ Buffer uploadé avec succès:', result.secure_url);
            resolve(result);
          }
        }
      );
      
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('❌ Erreur upload buffer:', error);
    throw new Error(`Erreur upload Cloudinary: ${error.message}`);
  }
};

const deleteFile = async (publicId) => {
  try {
    console.log('🔄 Suppression fichier Cloudinary:', publicId);
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('✅ Fichier supprimé avec succès:', publicId);
    return result;
  } catch (error) {
    console.error('❌ Erreur suppression fichier:', error);
    throw new Error(`Erreur suppression Cloudinary: ${error.message}`);
  }
};

const deleteMultipleFiles = async (publicIds) => {
  try {
    console.log('🔄 Suppression multiple fichiers Cloudinary:', publicIds);
    
    const result = await cloudinary.api.delete_resources(publicIds);
    console.log('✅ Fichiers supprimés avec succès:', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur suppression multiple fichiers:', error);
    throw new Error(`Erreur suppression multiple Cloudinary: ${error.message}`);
  }
};

// Fonction pour obtenir l'URL transformée
const getTransformedUrl = (publicId, transformations = {}) => {
  try {
    const url = cloudinary.url(publicId, {
      secure: true,
      ...transformations
    });
    return url;
  } catch (error) {
    console.error('❌ Erreur génération URL transformée:', error);
    throw new Error(`Erreur génération URL Cloudinary: ${error.message}`);
  }
};

// Fonction pour uploader plusieurs fichiers
const uploadMultipleFiles = async (files, folder = "", options = {}) => {
  try {
    console.log('🔄 Upload multiple fichiers vers Cloudinary:', files.length);
    
    const uploadPromises = files.map(file => 
      uploadFromBuffer(file.buffer, folder, options)
    );
    
    const results = await Promise.all(uploadPromises);
    console.log('✅ Fichiers multiples uploadés avec succès');
    return results;
  } catch (error) {
    console.error('❌ Erreur upload multiple fichiers:', error);
    throw new Error(`Erreur upload multiple Cloudinary: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadCircuitImage,
  uploadThemeFiles,
  uploadAudio,
  uploadVideo,
  uploadVirtualTour,
  uploadFile,
  uploadFromBuffer,
  deleteFile,
  deleteMultipleFiles,
  getTransformedUrl,
  uploadMultipleFiles
};

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const { MAX_FILE_SIZE_MB, ALLOWED_MEDIA_MIME_TYPES } = require('../constants');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const resourceType = file.mimetype.startsWith('video')
      ? 'video'
      : file.mimetype.startsWith('image')
      ? 'image'
      : 'raw'; // audio/documents

    return {
      folder: 'chatapp/media',
      resource_type: resourceType,
      allowed_formats: undefined, // rely on fileFilter below instead
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MEDIA_MIME_TYPES.includes(file.mimetype)) {
    return cb(new ApiError(415, `Unsupported file type: ${file.mimetype}`), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

module.exports = upload;

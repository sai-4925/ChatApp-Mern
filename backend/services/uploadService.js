const cloudinary = require('../config/cloudinary');

/**
 * Deletes a previously uploaded asset from Cloudinary by its public id.
 * Swallows errors (logs only) so a failed cleanup never blocks the main
 * request (e.g. updating a profile picture should succeed even if deleting
 * the old one fails).
 */
const deleteAsset = async (publicId, resourceType = 'image') => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset ${publicId}: ${error.message}`);
  }
};

/**
 * Maps a message `type` to the Cloudinary resource_type used when it was
 * uploaded (see uploadMiddleware.js) so deletions target the right bucket.
 */
const resourceTypeForMessageType = (type) => {
  if (type === 'video') return 'video';
  if (type === 'image') return 'image';
  return 'raw'; // audio/document
};

module.exports = { deleteAsset, resourceTypeForMessageType };

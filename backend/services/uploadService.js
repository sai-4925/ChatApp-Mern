const fs = require('fs');
const path = require('path');

/**
 * Deletes a previously uploaded file from local disk by its filename (publicId).
 * Swallows errors so a failed cleanup never blocks the main request.
 */
const deleteAsset = async (publicId) => {
  if (!publicId) return;

  const filePath = path.join(__dirname, '../uploads', publicId);

  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error(`Failed to delete local asset ${publicId}: ${error.message}`);
  }
};

/**
 * Kept for compatibility with existing call sites.
 * With local storage we ignore resourceType.
 */
const resourceTypeForMessageType = (type) => {
  if (type === 'video') return 'video';
  if (type === 'image') return 'image';
  return 'raw';
};

module.exports = { deleteAsset, resourceTypeForMessageType };
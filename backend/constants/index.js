module.exports = {
  MESSAGE_TYPES: ['text', 'image', 'video', 'audio', 'document'],
  MESSAGE_STATUS: ['sent', 'delivered', 'seen'],
  NOTIFICATION_TYPES: ['message', 'mention', 'group_add', 'group_remove', 'reaction'],
  THEMES: ['light', 'dark', 'system'],
  MAX_FILE_SIZE_MB: 25,
  ALLOWED_MEDIA_MIME_TYPES: [
    // images
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    // video
    'video/mp4',
    'video/webm',
    'video/quicktime',
    // audio
    'audio/mpeg',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    // documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
};

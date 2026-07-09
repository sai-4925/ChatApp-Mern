const mongoose = require('mongoose');
const { MESSAGE_TYPES, MESSAGE_STATUS } = require('../constants');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
      default: '',
    },
    type: {
      type: String,
      enum: MESSAGE_TYPES,
      default: 'text',
    },
    media: {
      url: { type: String },
      publicId: { type: String },
      fileName: { type: String },
      fileSize: { type: Number }, // bytes
      duration: { type: Number }, // seconds, for audio/video
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        emoji: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: MESSAGE_STATUS,
      default: 'sent',
    },
    deliveredTo: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
      },
    ],
    seenBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
      },
    ],
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    deletedForEveryone: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    isForwarded: {
      type: Boolean,
      default: false,
    },
    starredBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Speeds up fetching a conversation's messages in chronological order (pagination)
messageSchema.index({ conversation: 1, createdAt: -1 });
// Speeds up full-text search-within-conversation
messageSchema.index({ content: 'text' });

module.exports = mongoose.model('Message', messageSchema);

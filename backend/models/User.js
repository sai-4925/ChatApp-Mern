const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { THEMES } = require('../constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-z0-9_.]+$/, 'Username can only contain letters, numbers, underscores, and periods'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    bio: {
      type: String,
      default: 'Hey there! I am using ChatApp.',
      maxlength: [150, 'Bio cannot exceed 150 characters'],
    },
    status: {
      type: String,
      default: '',
      maxlength: [100, 'Status cannot exceed 100 characters'],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      select: false,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
      default: null,
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    settings: {
      theme: {
        type: String,
        enum: THEMES,
        default: 'system',
      },
      notifications: {
        sound: { type: Boolean, default: true },
        browser: { type: Boolean, default: true },
      },
      privacy: {
        lastSeen: {
          type: String,
          enum: ['everyone', 'contacts', 'nobody'],
          default: 'everyone',
        },
        readReceipts: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);

// Indexes for fast lookups/search
userSchema.index({ username: 'text', name: 'text', email: 'text' });

// Hash password before saving, only if modified
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

// Compare a plaintext candidate password against the stored hash
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Strip sensitive fields whenever a user document is serialized
userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

// Generates a raw reset token (sent to the user) while storing only its
// hashed version in the DB, following the standard "never store secrets
// in plaintext" pattern.
userSchema.methods.generatePasswordResetToken = function generatePasswordResetToken() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);

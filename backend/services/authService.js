const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

/**
 * Creates a new user account. Throws 409 if the email/username is taken.
 */
const registerUser = async ({ name, username, email, password }) => {
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    const field = existingUser.email === email ? 'Email' : 'Username';
    throw new ApiError(409, `${field} is already in use`);
  }

  const user = await User.create({ name, username, email, password });
  return user;
};

/**
 * Verifies credentials and issues access + refresh tokens.
 */
const loginUser = async ({ email, password, rememberMe }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken = generateAccessToken(user._id, rememberMe);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  user.isOnline = true;
  await user.save();

  return { user, accessToken, refreshToken };
};

/**
 * Clears the stored refresh token and marks the user offline.
 */
const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    refreshToken: null,
    isOnline: false,
    lastSeen: new Date(),
  });
};

/**
 * Issues a new access token from a valid, still-registered refresh token.
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, 'No refresh token provided');
  }

  const { verifyToken } = require('../utils/generateToken');
  let decoded;
  try {
    decoded = verifyToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(401, 'Refresh token is no longer valid');
  }

  const newAccessToken = generateAccessToken(user._id);
  return { user, accessToken: newAccessToken };
};

/**
 * Generates a password reset token and returns both the user and the raw
 * (unhashed) token to be emailed to the user.
 */
const createPasswordResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Intentionally do not reveal whether the email exists.
    return null;
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });
  return { user, resetToken };
};

/**
 * Verifies a reset token and updates the user's password.
 */
const resetPassword = async (rawToken, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpire');

  if (!user) {
    throw new ApiError(400, 'Reset token is invalid or has expired');
  }

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();

  return user;
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  createPasswordResetToken,
  resetPassword,
};

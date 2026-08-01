const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');
const emailService = require('../services/emailService');
const { sendSuccess } = require('../utils/apiResponse');
const { getTokenCookieOptions } = require('../helpers/cookieOptions');

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'chatapp_token';

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;
  const user = await authService.registerUser({ name, username, email, password });

  return sendSuccess(res, 201, 'Account created successfully. Please log in.', {
    user: user.toSafeObject(),
  });
});

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser({
    email,
    password,
    rememberMe,
  });

  res.cookie(COOKIE_NAME, accessToken, getTokenCookieOptions(rememberMe));

  return sendSuccess(res, 200, 'Logged in successfully', {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  });
});

/**
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);
  res.clearCookie(COOKIE_NAME);
  return sendSuccess(res, 200, 'Logged out successfully');
});

/**
 * @route   POST /api/auth/refresh-token
 * @access  Public (requires valid refresh token in body or cookie)
 */
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  const { user, accessToken } = await authService.refreshAccessToken(token);

  res.cookie(COOKIE_NAME, accessToken, getTokenCookieOptions(false));

  return sendSuccess(res, 200, 'Token refreshed', {
    user: user.toSafeObject(),
    accessToken,
  });
});

/**
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.createPasswordResetToken(email);

  if (result) {
    try {
      await emailService.sendPasswordResetEmail(email, result.resetToken);
    } catch (error) {
      console.error(`Failed to send password reset email to ${email}:`, error.message || error);
      console.log(`Password reset token for ${email}: ${result.resetToken}`);
    }
  }

  return sendSuccess(
    res,
    200,
    'If an account with that email exists, a password reset link has been sent.'
  );
});

/**
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPasswordHandler = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  return sendSuccess(res, 200, 'Password has been reset successfully. Please log in.');
});

/**
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, 'Current user fetched', {
    user: req.user.toSafeObject(),
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword: resetPasswordHandler,
  getMe,
};

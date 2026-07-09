const asyncHandler = require('express-async-handler');
const { verifyToken } = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

/**
 * Verifies the JWT sent either via the `Authorization: Bearer <token>` header
 * or the httpOnly cookie, and attaches the authenticated user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.[process.env.JWT_COOKIE_NAME || 'chatapp_token']) {
    token = req.cookies[process.env.JWT_COOKIE_NAME || 'chatapp_token'];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    throw new ApiError(401, 'Not authorized, token invalid or expired');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'Not authorized, user no longer exists');
  }

  req.user = user;
  next();
});

module.exports = { protect };

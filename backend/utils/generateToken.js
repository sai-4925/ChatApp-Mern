const jwt = require('jsonwebtoken');

/**
 * Generate a short-lived access token carrying the user id.
 * @param {string} userId
 * @param {boolean} rememberMe - if true, use the longer expiry window
 */
const generateAccessToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe
    ? process.env.JWT_REMEMBER_EXPIRES_IN || '30d'
    : process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Generate a long-lived refresh token used to silently reissue access tokens.
 * @param {string} userId
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId, type: 'refresh' }, process.env.JWT_SECRET, {
    expiresIn: '60d',
  });
};

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };

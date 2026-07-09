const { verifyToken } = require('../utils/generateToken');
const User = require('../models/User');

/**
 * Socket.io middleware: expects the access token in `socket.handshake.auth.token`.
 * Attaches the authenticated user to `socket.user` for downstream handlers.
 */
const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: no token provided'));
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error('Authentication error: user not found'));
    }

    socket.user = user;
    return next();
  } catch (error) {
    return next(new Error('Authentication error: invalid or expired token'));
  }
};

module.exports = socketAuth;

/**
 * Send a consistent success response shape across all endpoints.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {object} [data]
 */
const sendSuccess = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

/**
 * Send a consistent error response shape. Prefer throwing errors and letting
 * the global error middleware handle them; this helper exists for the rare
 * case a controller needs to short-circuit without throwing.
 */
const sendError = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

module.exports = { sendSuccess, sendError };

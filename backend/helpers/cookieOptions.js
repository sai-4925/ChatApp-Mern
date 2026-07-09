/**
 * Builds cookie options for the auth token cookie. `rememberMe` extends
 * the maxAge to match the longer-lived JWT; otherwise it's a session cookie.
 */
const getTokenCookieOptions = (rememberMe = false) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  ...(rememberMe ? { maxAge: 30 * 24 * 60 * 60 * 1000 } : {}), // 30 days, else session cookie
});

module.exports = { getTokenCookieOptions };

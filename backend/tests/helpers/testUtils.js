const request = require('supertest');
const app = require('../../app');

/**
 * Registers and logs in a user, returning both the auth token and user object.
 */
const createAuthenticatedUser = async (overrides = {}) => {
  const userData = {
    name: 'Test User',
    username: `user${Date.now()}${Math.floor(Math.random() * 10000)}`,
    email: `user${Date.now()}${Math.floor(Math.random() * 10000)}@example.com`,
    password: 'Password123',
    ...overrides,
  };

  await request(app).post('/api/auth/register').send(userData);
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: userData.email, password: userData.password });

  return {
    token: loginRes.body.accessToken,
    user: loginRes.body.user,
  };
};

module.exports = { createAuthenticatedUser };

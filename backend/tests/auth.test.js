const request = require('supertest');
const app = require('../app');

const validUser = {
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123',
};

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('creates a new account with valid data', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(validUser.email);
      expect(res.body.user.password).toBeUndefined();
    });

    it('rejects a duplicate email', async () => {
      await request(app).post('/api/auth/register').send(validUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, username: 'differentusername' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('rejects an invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'not-an-email' });

      expect(res.status).toBe(400);
    });

    it('rejects a weak password (no number)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'other@example.com', username: 'otheruser', password: 'onlyletters' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validUser);
    });

    it('logs in with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.email).toBe(validUser.email);
    });

    it('rejects an incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'WrongPassword123' });

      expect(res.status).toBe(401);
    });

    it('rejects a non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: validUser.password });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('rejects requests without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns the current user with a valid token', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.user.email).toBe(validUser.email);
    });
  });
});

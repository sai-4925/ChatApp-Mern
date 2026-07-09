const request = require('supertest');
const app = require('../app');
const { createAuthenticatedUser } = require('./helpers/testUtils');

describe('Conversation API', () => {
  it('creates a new 1:1 conversation between two users', async () => {
    const userA = await createAuthenticatedUser();
    const userB = await createAuthenticatedUser();

    const res = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ participantId: userB.user._id });

    expect(res.status).toBe(200);
    expect(res.body.conversation.participants).toHaveLength(2);
  });

  it('returns the same conversation if one already exists between the pair', async () => {
    const userA = await createAuthenticatedUser();
    const userB = await createAuthenticatedUser();

    const first = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ participantId: userB.user._id });

    const second = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ participantId: userB.user._id });

    expect(first.body.conversation._id).toBe(second.body.conversation._id);
  });

  it('rejects starting a conversation with yourself', async () => {
    const userA = await createAuthenticatedUser();

    const res = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ participantId: userA.user._id });

    expect(res.status).toBe(400);
  });

  it('lists conversations for the authenticated user', async () => {
    const userA = await createAuthenticatedUser();
    const userB = await createAuthenticatedUser();

    await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ participantId: userB.user._id });

    const res = await request(app)
      .get('/api/conversations')
      .set('Authorization', `Bearer ${userA.token}`);

    expect(res.status).toBe(200);
    expect(res.body.conversations).toHaveLength(1);
  });

  it('toggles pin status on a conversation', async () => {
    const userA = await createAuthenticatedUser();
    const userB = await createAuthenticatedUser();

    const createRes = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ participantId: userB.user._id });

    const conversationId = createRes.body.conversation._id;

    const pinRes = await request(app)
      .put(`/api/conversations/${conversationId}/pin`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(pinRes.status).toBe(200);
    expect(pinRes.body.conversation.pinnedBy).toContain(userA.user._id);
  });
});

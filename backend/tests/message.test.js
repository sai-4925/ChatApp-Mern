const request = require('supertest');
const app = require('../app');
const { createAuthenticatedUser } = require('./helpers/testUtils');

const setupConversation = async () => {
  const userA = await createAuthenticatedUser();
  const userB = await createAuthenticatedUser();

  const convRes = await request(app)
    .post('/api/conversations')
    .set('Authorization', `Bearer ${userA.token}`)
    .send({ participantId: userB.user._id });

  return { userA, userB, conversationId: convRes.body.conversation._id };
};

describe('Message API', () => {
  it('sends a text message and returns it with sender populated', async () => {
    const { userA, conversationId } = await setupConversation();

    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ conversationId, content: 'Hello there', type: 'text' });

    expect(res.status).toBe(201);
    expect(res.body.message.content).toBe('Hello there');
    expect(res.body.message.sender.name).toBe(userA.user.name);
  });

  it('rejects sending a message to a conversation you are not part of', async () => {
    const { conversationId } = await setupConversation();
    const outsider = await createAuthenticatedUser();

    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${outsider.token}`)
      .send({ conversationId, content: 'Sneaky message', type: 'text' });

    expect(res.status).toBe(404);
  });

  it('fetches messages for a conversation in chronological order', async () => {
    const { userA, conversationId } = await setupConversation();

    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ conversationId, content: 'First', type: 'text' });
    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ conversationId, content: 'Second', type: 'text' });

    const res = await request(app)
      .get(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(res.status).toBe(200);
    expect(res.body.messages).toHaveLength(2);
    expect(res.body.messages[0].content).toBe('First');
  });

  it('allows the sender to edit their own text message', async () => {
    const { userA, conversationId } = await setupConversation();

    const sendRes = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ conversationId, content: 'Original', type: 'text' });

    const editRes = await request(app)
      .put(`/api/messages/${sendRes.body.message._id}`)
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ content: 'Edited' });

    expect(editRes.status).toBe(200);
    expect(editRes.body.message.content).toBe('Edited');
    expect(editRes.body.message.isEdited).toBe(true);
  });

  it('prevents a different user from editing someone else\'s message', async () => {
    const { userA, userB, conversationId } = await setupConversation();

    const sendRes = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ conversationId, content: 'Original', type: 'text' });

    const editRes = await request(app)
      .put(`/api/messages/${sendRes.body.message._id}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ content: 'Hijacked' });

    expect(editRes.status).toBe(403);
  });

  it('toggles a reaction on a message', async () => {
    const { userA, userB, conversationId } = await setupConversation();

    const sendRes = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ conversationId, content: 'React to this', type: 'text' });

    const reactRes = await request(app)
      .post(`/api/messages/${sendRes.body.message._id}/react`)
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ emoji: '👍' });

    expect(reactRes.status).toBe(200);
    expect(reactRes.body.message.reactions).toHaveLength(1);
  });

  it('deletes a message for everyone (sender only)', async () => {
    const { userA, conversationId } = await setupConversation();

    const sendRes = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ conversationId, content: 'Oops', type: 'text' });

    const deleteRes = await request(app)
      .delete(`/api/messages/${sendRes.body.message._id}/everyone`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(deleteRes.status).toBe(200);
  });
});

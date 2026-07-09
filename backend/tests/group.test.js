const request = require('supertest');
const app = require('../app');
const { createAuthenticatedUser } = require('./helpers/testUtils');

describe('Group API', () => {
  it('creates a group with the creator as admin and member', async () => {
    const creator = await createAuthenticatedUser();
    const memberB = await createAuthenticatedUser();

    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${creator.token}`)
      .send({ name: 'Trip Crew', memberIds: [memberB.user._id] });

    expect(res.status).toBe(201);
    expect(res.body.group.members).toHaveLength(2);
    expect(res.body.group.admins).toHaveLength(1);
    expect(res.body.conversation.isGroup).toBe(true);
  });

  it('allows an admin to add a new member', async () => {
    const creator = await createAuthenticatedUser();
    const memberB = await createAuthenticatedUser();
    const memberC = await createAuthenticatedUser();

    const createRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${creator.token}`)
      .send({ name: 'Trip Crew', memberIds: [memberB.user._id] });

    const addRes = await request(app)
      .post(`/api/groups/${createRes.body.group._id}/members`)
      .set('Authorization', `Bearer ${creator.token}`)
      .send({ memberIds: [memberC.user._id] });

    expect(addRes.status).toBe(200);
    expect(addRes.body.group.members).toHaveLength(3);
  });

  it('rejects a non-admin trying to add members', async () => {
    const creator = await createAuthenticatedUser();
    const memberB = await createAuthenticatedUser();
    const memberC = await createAuthenticatedUser();

    const createRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${creator.token}`)
      .send({ name: 'Trip Crew', memberIds: [memberB.user._id] });

    const addRes = await request(app)
      .post(`/api/groups/${createRes.body.group._id}/members`)
      .set('Authorization', `Bearer ${memberB.token}`)
      .send({ memberIds: [memberC.user._id] });

    expect(addRes.status).toBe(403);
  });

  it('allows an admin to remove a member', async () => {
    const creator = await createAuthenticatedUser();
    const memberB = await createAuthenticatedUser();

    const createRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${creator.token}`)
      .send({ name: 'Trip Crew', memberIds: [memberB.user._id] });

    const removeRes = await request(app)
      .delete(`/api/groups/${createRes.body.group._id}/members/${memberB.user._id}`)
      .set('Authorization', `Bearer ${creator.token}`);

    expect(removeRes.status).toBe(200);
    expect(removeRes.body.group.members).toHaveLength(1);
  });
});

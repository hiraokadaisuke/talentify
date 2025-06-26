const request = require('supertest');
const { initTestApp, shutdown } = require('./helpers');

let app;

beforeAll(async () => {
  app = await initTestApp();
});

afterAll(async () => {
  await shutdown();
});

describe('Talent API', () => {
  test('create and fetch talents', async () => {
    const agent = request.agent(app);

    let res = await agent.get('/api/csrf-token');
    let csrf = res.body.csrfToken;
    await agent
      .post('/api/register')
      .set('csrf-token', csrf)
      .send({ email: 'store@example.com', password: 'secret', role: 'store' });

    res = await agent.get('/api/csrf-token');
    csrf = res.body.csrfToken;
    await agent
      .post('/api/login')
      .set('csrf-token', csrf)
      .send({ email: 'store@example.com', password: 'secret' });

    res = await agent.get('/api/csrf-token');
    csrf = res.body.csrfToken;
    res = await agent
      .post('/api/talents')
      .set('csrf-token', csrf)
      .send({ name: 'Talent', email: 'talent@example.com' });
    expect(res.statusCode).toBe(201);
    const talentId = res.body._id;

    res = await agent.get('/api/talents');
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    res = await agent.get(`/api/talents/${talentId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(talentId);
  });
});

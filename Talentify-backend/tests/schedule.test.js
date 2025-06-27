const request = require('supertest');
const { initTestApp, shutdown } = require('./helpers');

let app;

beforeAll(async () => {
  app = await initTestApp();
});

afterAll(async () => {
  await shutdown();
});

describe('Schedule API', () => {
  test('create and fetch schedules', async () => {
    const agent = request.agent(app);

    // register user
    let res = await agent.get('/api/csrf-token');
    let csrf = res.body.csrfToken;
    await agent
      .post('/api/register')
      .set('csrf-token', csrf)
      .send({ email: 'user@example.com', password: 'secret', role: 'store' });

    // login
    res = await agent.get('/api/csrf-token');
    csrf = res.body.csrfToken;
    await agent
      .post('/api/login')
      .set('csrf-token', csrf)
      .send({ email: 'user@example.com', password: 'secret' });

    // create schedule
    res = await agent.get('/api/csrf-token');
    csrf = res.body.csrfToken;
    const date = new Date().toISOString();
    res = await agent
      .post('/api/schedule')
      .set('csrf-token', csrf)
      .send({ date, description: 'Test schedule' });
    expect(res.statusCode).toBe(201);

    // fetch schedules
    res = await agent.get('/api/schedule');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].description).toBe('Test schedule');
  });
});

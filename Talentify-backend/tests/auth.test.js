const request = require('supertest');
const { initTestApp, shutdown } = require('./helpers');

let app;

beforeAll(async () => {
  app = await initTestApp();
});

afterAll(async () => {
  await shutdown();
});

describe('User registration and login', () => {
  test('register and login user', async () => {
    const agent = request.agent(app);

    let res = await agent.get('/api/csrf-token');
    const csrf = res.body.csrfToken;

    res = await agent
      .post('/api/register')
      .set('csrf-token', csrf)
      .send({ email: 'test@example.com', password: 'secret', role: 'store' });
    expect(res.statusCode).toBe(201);

    res = await agent.get('/api/csrf-token');
    const loginCsrf = res.body.csrfToken;

    res = await agent
      .post('/api/login')
      .set('csrf-token', loginCsrf)
      .send({ email: 'test@example.com', password: 'secret' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringMatching(/access=/)])
    );
  });
});

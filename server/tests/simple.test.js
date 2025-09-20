const request = require('supertest');
const app = require('../index');

describe('Simple API Tests', () => {
  it('should return health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe('OK');
  });
});
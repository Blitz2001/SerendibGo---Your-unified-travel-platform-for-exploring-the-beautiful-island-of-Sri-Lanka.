const request = require('supertest');
const app = require('../index');

describe('Basic API Tests', () => {
  describe('GET /health', () => {
    it('should return health check status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });
  });

  describe('GET /api/tours', () => {
    it('should return tours list', async () => {
      const response = await request(app)
        .get('/api/tours')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tours');
    });
  });

  describe('GET /api/vehicles', () => {
    it('should return vehicles list', async () => {
      const response = await request(app)
        .get('/api/vehicles')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      // Vehicles API returns vehicles directly, not in data property
      expect(response.body).toHaveProperty('vehicles');
    });
  });

  describe('GET /api/hotels', () => {
    it('should return hotels list', async () => {
      const response = await request(app)
        .get('/api/hotels')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('hotels');
    });
  });
});

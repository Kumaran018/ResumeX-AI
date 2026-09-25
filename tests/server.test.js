const request = require('supertest');
const express = require('express');
const { AppError } = require('../src/utils/errors');
const { errorHandler } = require('../src/middlewares/errorHandler');

const app = express();

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Backend is healthy and running.' });
});

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(errorHandler);

describe('Backend Server Core Routes', () => {
  it('should return success on health endpoint', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('should return 404 on unhandled routes', async () => {
    const res = await request(app).get('/api/invalid-route-12345');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('fail');
  });
});

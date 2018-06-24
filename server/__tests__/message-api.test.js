
const request = require('supertest');
const messageApi = require('../message-api');

describe('message-api.js', () => {
  test('the root path should respond to GET method', async () => {
    const response = await request(messageApi).get('/');
    expect(response.statusCode).toBe(200);
  });

  // TODO: Tests for remaining routes.
});

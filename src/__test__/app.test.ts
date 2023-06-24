import request from 'supertest';
import { app } from '../server';

describe('App', () => {
    test('should listen on the configured port', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        // Add more assertions to validate the response if needed
    });
});

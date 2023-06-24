import request from 'supertest';
import { app } from '../server';
import mongoose from 'mongoose';

// afterAll(async () => {
//     await mongoose.disconnect();
//     await mongoServer.stop();
// });
describe('App', () => {
    test('test router should return status 200', async () => {
        const response = await request(app).get('/api/');
        expect(response.statusCode).toBe(200);
    });
});

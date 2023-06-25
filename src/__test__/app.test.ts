import request from 'supertest';
import { app } from '../server';
import mongoose from 'mongoose';
import Streamer from '../models/Streamer';

//import mongo server instance for testing purposes
import { mongoServer } from '../config/db';

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});
beforeEach(async () => {
    await Streamer.deleteMany({});
});

describe('App', () => {
    test('test router should return status 200', async () => {
        const response = await request(app).get('/api/');
        expect(response.statusCode).toBe(200);
    });
});

describe('getAllStreamers', () => {
    it('should return all streamers with pagination details', async () => {
        const mockData = [
            {
                name: 'John Doe',
                platforms: ['Twitch'],
                description: 'Streamer 1 description',
                votes: { up: 10, down: 5 },
                image: Buffer.from('sample-image-1')
            },
            {
                name: 'Foo Bar',
                platforms: ['YouTube', 'Twitch'],
                description: 'Streamer 2 description',
                votes: { up: 8, down: 3 },
                image: Buffer.from('sample-image-2')
            }
        ];

        await Streamer.create(mockData);

        const response: any = await request(app).get('/api/streamers');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('Success');
        expect(response.body.streamers.length).toBe(mockData.length);

        expect(response.body.totalPages).toBe(1);
        expect(response.body.currentPage).toBe(1);
        expect(response.body.totalDocuments).toBe(mockData.length);
    });
});

describe('createStreamer', () => {
    it('should create a new streamer', async () => {
        const requestBody = {
            name: 'John Doe',
            description: 'Son of Foo Bar',
            platforms: ['Twitch']
        };

        const response: any = await request(app).post('/api/streamer').send(requestBody);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('Success');
        expect(response.body.message).toBe('Streamer has been successfully created');
        expect(response.body.streamer.name).toBe(requestBody.name);
        expect(response.body.streamer.description).toBe(requestBody.description);
        expect(response.body.streamer.platforms).toEqual(requestBody.platforms);
    });

    it('should return an error if the streamer already exists', async () => {
        // Mock streamer for testing
        const mockDataStreamer = {
            name: 'Existing Streamer',
            description: 'Existing streamer description',
            platforms: ['YouTube']
        };

        await Streamer.create(mockDataStreamer);

        const requestBody = {
            name: 'Existing Streamer',
            description: 'New description',
            platforms: ['Twitch']
        };

        const response: any = await request(app).post('/api/streamer').send(requestBody);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('Error');
        expect(response.body.message).toBe('Streamer already exists');
    });
});

describe('voteForStreamer', () => {
    it('should vote for a streamer', async () => {
        const mockStreamer = await Streamer.create({
            name: 'John Doe',
            platforms: ['Twitch'],
            description: 'Streamer 1 description',
            votes: { up: 0, down: 0 }
        });

        const response = await request(app).put(`/api/streamer/${mockStreamer._id}`).send({ voteType: 'up' });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('Success');
        expect(response.body.message).toBe('Your vote has been successfully added!');
        expect(response.body.votes.up).toBe(1);
        expect(response.body.votes.down).toBe(0);
    });

    it('should return 400 if voteType is not provided', async () => {
        const mockStreamer = await Streamer.create({
            name: 'John Doe',
            platforms: ['Twitch'],
            description: 'Streamer 1 description',
            votes: { up: 0, down: 0 }
        });

        const response = await request(app).put(`/api/streamer/${mockStreamer._id}`).send();

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('Error');
        expect(response.body.message).toBe('Invalid request. Please provide voteType.');
    });
    it('should return 404 if streamer is not found', async () => {
        const newStreamer = new Streamer({
            name: 'John Doe',
            platforms: ['Twitch'],
            description: 'Streamer 1 description',
            votes: { up: 0, down: 0 }
        });

        // Generate a non-existent streamer id
        const nonExistentStreamerId = new mongoose.Types.ObjectId();

        // Make a request with the non-existent streamer id
        const response = await request(app).put(`/api/streamer/${nonExistentStreamerId}`).send({ voteType: 'up' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            status: 'Error',
            message: 'Streamer not found.'
        });
    });
});

describe('findStreamerByName', () => {
    it('should find a streamer by name', async () => {
        // Create a mock streamer
        const mockStreamer = await Streamer.create({
            name: 'John Doe',
            platforms: ['Twitch'],
            description: 'Streamer 1 description',
            votes: { up: 0, down: 0 }
        });

        const response = await request(app).post('/api/streamer/find-by-name').send({ name: 'John Doe' });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('Success');
        expect(response.body.message).toBe('Streamer has been successfully found!');
        expect(response.body.streamer.length).toBe(1);
        expect(response.body.streamer[0]._id).toEqual(mockStreamer._id.toString());
    });

    it('should return 404 if streamer is not found', async () => {
        const response = await request(app).post('/api/streamer/find-by-name').send({ name: 'Non-existent Streamer' });

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('Error');
        expect(response.body.message).toBe('Streamer not found!');
    });

    it('should return 500 if an error occurs during the search', async () => {
        // Mock an error during the search
        jest.spyOn(Streamer, 'find').mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).post('/api/streamer/find-by-name').send({ name: 'John Doe' });

        expect(response.status).toBe(500);
        expect(response.text).toBe('Internal Server Error');
    });
});

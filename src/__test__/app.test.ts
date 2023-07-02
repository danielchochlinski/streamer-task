import request from 'supertest';
import { app } from '../server';
import mongoose from 'mongoose';
import Streamer, { IStreamer } from '../models/Streamer';

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

describe('findStreamerByName', () => {
    it('should find a streamer by name', async () => {
        const mockStreamer = await Streamer.create({
            name: 'John Doe',
            platforms: ['Twitch'],
            description: 'Test description',
            votes: { up: 0, down: 0 }
        });

        const response = await request(app).get('/api/streamer?name=John%20Doe');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('SUCCESS');
        expect(response.body.message).toBe('Streamer has been successfully found!');
        expect(response.body.streamer).toBeDefined();
        expect(response.body.streamer).toBeInstanceOf(Object);
        expect(response.body.streamer._id).toEqual(mockStreamer._id.toString());
    });

    it('should return 204 if streamer is not found', async () => {
        const response = await request(app).get('/api/streamer?name=Non-existent%20Streamer');

        expect(response.status).toBe(204);
        expect(response.body).toEqual({});

        expect(response.header['content-type']).toBeUndefined();
        expect(response.header['content-length']).toBeUndefined();
    });
    it('should return 500 if an error occurs during the search', async () => {
        // Mock an error during the search
        jest.spyOn(Streamer, 'findOne').mockImplementationOnce(() => {
            throw new Error('Internal Server Error');
        });

        const response = await request(app).get('/api/streamer?name=John%20Doe');

        expect(response.status).toBe(500);
        expect(response.body.status).toBe('ERROR');
        expect(response.body.message).toBe('Internal Server Error');
    });
});

describe('getAllStreamers', () => {
    it('should return all streamers with pagination details', async () => {
        const mockData = [
            {
                name: 'John Doe',
                platforms: ['Twitch'],
                description: 'Test description',
                votes: { up: 10, down: 5 },
                image: Buffer.from('sample-image-1')
            },
            {
                name: 'Foo Bar',
                platforms: ['YouTube', 'Twitch'],
                description: 'Test description',
                votes: { up: 8, down: 3 },
                image: Buffer.from('sample-image-2')
            }
        ];

        await Streamer.create(mockData);

        const response: any = await request(app).get('/api/streamers');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('SUCCESS');
        expect(response.body.streamers.length).toBe(mockData.length);

        expect(response.body.totalPages).toBe(1);
        expect(response.body.currentPage).toBe(1);
        expect(response.body.totalDocuments).toBe(mockData.length);
    });
});

describe('createStreamer', () => {
    it('should create a new streamer', async () => {
        // Mock request body and compressed image
        const requestBody = {
            name: 'John Doe',
            description: 'Test description',
            platforms: JSON.stringify(['Twitch'])
        };
        const compressedImage = 'mocked-compressed-image';

        jest.spyOn(Streamer, 'findOne').mockResolvedValueOnce(null);

        const createdStreamer = {
            _id: 'mocked-id',
            name: requestBody.name,
            description: requestBody.description,
            platforms: ['Twitch'],
            image: compressedImage
        };
        jest.spyOn(Streamer, 'create').mockResolvedValueOnce(createdStreamer as any);

        const response = await request(app).post('/api/streamer').send(requestBody).set('compressed-image', compressedImage);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('SUCCESS');
        expect(response.body.message).toBe('Streamer has been successfully created');
        expect(response.body.streamer).toEqual(createdStreamer);
    });

    it('should return an error if the streamer already exists', async () => {
        // Mock streamer for testing
        const mockDataStreamer = {
            name: 'John Doe',
            description: 'Test description',
            platforms: ['YouTube']
        };

        await Streamer.create(mockDataStreamer);

        const requestBody = {
            name: 'John Doe',
            description: 'Test description',
            platforms: ['Twitch']
        };

        const response = await request(app).post('/api/streamer').send(requestBody);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('WARNING');
        expect(response.body.message).toBe('Streamer already exists');
    });
});

describe('voteForStreamer', () => {
    it('should vote for a streamer', async () => {
        const mockStreamer = await Streamer.create({
            name: 'John Doe',
            platforms: ['Twitch'],
            description: 'Test description',
            votes: { up: 0, down: 0 }
        });

        const response = await request(app).put(`/api/streamer/${mockStreamer._id}`).send({ voteType: 'up' });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('SUCCESS');
        expect(response.body.message).toBe('Your vote has been successfully added!');
        expect(response.body.votes.up).toBe(1);
        expect(response.body.votes.down).toBe(0);
    });

    it('should return 400 if voteType is not provided', async () => {
        const mockStreamer = await Streamer.create({
            name: 'John Doe',
            platforms: ['Twitch'],
            description: 'Test description',
            votes: { up: 0, down: 0 }
        });

        const response = await request(app).put(`/api/streamer/${mockStreamer._id}`).send();

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('ERROR');
        expect(response.body.message).toBe('Invalid request. Please provide voteType.');
    });

    it('should return 204 if streamer is not found', async () => {
        const newStreamer = new Streamer({
            name: 'John Doe',
            platforms: ['Twitch'],
            description: 'Test description',
            votes: { up: 0, down: 0 }
        });

        // Generate a non-existent streamer id
        const nonExistentStreamerId = new mongoose.Types.ObjectId();

        // Make a request with the non-existent streamer id
        const response = await request(app).put(`/api/streamer/${nonExistentStreamerId}`).send({ voteType: 'up' });

        expect(response.status).toBe(204);
        expect(response.body).toEqual({});

        expect(response.header['content-type']).toBeUndefined();
        expect(response.header['content-length']).toBeUndefined();
    });
});

describe('getPopularStreamers', () => {
    it('should return popular streamers', async () => {
        // Create mock popular streamers
        const mockStreamers = [
            {
                name: 'Streamer 1',
                votes: { up: 10 },
                description: 'Test'
            },
            {
                name: 'Streamer 2',
                votes: { up: 8 },
                description: 'Test'
            },
            {
                name: 'Streamer 3',
                votes: { up: 12 },
                description: 'Test'
            },
            {
                name: 'Streamer 4',
                votes: { up: 15 },
                description: 'Test'
            },
            {
                name: 'Streamer 5',
                votes: { up: 9 },
                description: 'Test'
            },
            {
                name: 'Streamer 6',
                votes: { up: 11 },
                description: 'Test'
            }
        ];

        await Streamer.create(mockStreamers);

        const response = await request(app).get('/api/streamers/popular');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('SUCCESS');
        expect(response.body.popularStreamers.length).toBe(5);
        expect(response.body.popularStreamers[0].votes.up).toBe(15);
        expect(response.body.popularStreamers[1].votes.up).toBe(12);
        expect(response.body.popularStreamers[2].votes.up).toBe(11);
        expect(response.body.popularStreamers[3].votes.up).toBe(10);
        expect(response.body.popularStreamers[4].votes.up).toBe(9);
    });

    it('should return 204 if no popular streamers are found', async () => {
        const response = await request(app).get('/api/streamers/popular');

        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
    });
});

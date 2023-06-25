import mongoose from 'mongoose';
import { config } from './config';
import { MongoMemoryServer } from 'mongodb-memory-server';

//mongodb connection
const connectDB = async () => {
    try {
        const connect = await mongoose.connect(config.mongo.url);
        console.log(`mongo db connected: ${connect.connection.host}`);
        console.log(`url ${config.mongo.url}`);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

//in memory server used for testing
export let mongoServer: MongoMemoryServer;
const connectDBTest = async () => {
    try {
        mongoServer = new MongoMemoryServer();
        await mongoServer.start();

        const mongoUri = mongoServer.getUri();
        console.log(mongoUri, 'MONGO TEST SERVER');
        await mongoose.connect(mongoUri);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

export const connectToDatabase = () => {
    process.env.NODE_ENV === 'test' ? connectDBTest() : connectDB();
};

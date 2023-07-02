import express from 'express';
import { config } from './config/config';
import { connectToDatabase } from './config/db';
import bodyParser from 'body-parser';
import testRouter from './routes/test';
import streamerRouter from './routes/streamer';
import cors from 'cors';
export const app = express();

connectToDatabase();

app.use(bodyParser.json());

app.use(cors());

app.use('/api', testRouter);
app.use('/api', streamerRouter);

app.listen(config.server.port || 3000, () => {
    console.log(`app is listening on ${config.server.port}`);
});

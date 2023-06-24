import express, { Request, Response } from 'express';
import { config } from './config/config';
import { connectToDatabase } from './config/db';
import bodyParser from 'body-parser';

import testRouter from './routes/test';
export const app = express();
import streamerRouter from './routes/streamer';
connectToDatabase();
app.use(bodyParser.json());

app.use('/api', testRouter);
app.use('/api', streamerRouter);
app.listen(config.server.port || 3000, () => {
    console.log(`app is listening on ${config.server.port}`);
});

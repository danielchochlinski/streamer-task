import { Router } from 'express';
import { imageMiddleware } from '../middleware/imageMiddleware';
import { createStreamer } from '../controllers/streamersController';
const router = Router();

router.post('/streamer', imageMiddleware, createStreamer);

export default router;

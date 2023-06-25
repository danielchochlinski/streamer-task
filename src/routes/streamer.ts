import { Router } from 'express';
import { imageMiddleware } from '../middleware/imageMiddleware';
import { createStreamer, findStreamerByName, getAllStreamers, voteForStreamer } from '../controllers/streamersController';
const router = Router();

router.get('/streamers', getAllStreamers);
router.post('/streamer', imageMiddleware, createStreamer);
router.put('/streamer/:id', voteForStreamer);
router.get('/streamer', findStreamerByName);
export default router;

import { Router } from 'express';
import { imageMiddleware } from '../middleware/imageMiddleware';
import {
    createStreamer,
    findStreamerByName,
    getAllStreamerNames,
    getAllStreamers,
    getPopularStreamers,
    voteForStreamer
} from '../controllers/streamersController';
const router = Router();

router.get('/streamers-names', getAllStreamerNames);
router.get('/streamers', getAllStreamers);
router.post('/streamer', imageMiddleware, createStreamer);
router.put('/streamer/:id', voteForStreamer);
router.get('/streamer', findStreamerByName);
router.get('/streamers/popular', getPopularStreamers);
export default router;

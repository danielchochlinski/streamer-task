import { Router } from 'express';
import { testAppController } from '../controllers/test';

const router = Router();

router.get('/', testAppController);

export default router;

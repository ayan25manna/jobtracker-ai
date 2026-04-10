import { Router } from 'express';
import { parse, suggest } from '../controllers/ai.controller';
import { verifyJWT } from '../middleware/auth';

const router = Router();

router.use(verifyJWT);

router.post('/parse', parse);
router.post('/suggest', suggest);

export default router;

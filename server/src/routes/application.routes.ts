import { Router } from 'express';
import { getAll, create, update, remove } from '../controllers/application.controller';
import { verifyJWT } from '../middleware/auth';

const router = Router();

// All application routes are protected
router.use(verifyJWT);

router.get('/', getAll);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;

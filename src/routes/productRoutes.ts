import { Router } from 'express';
import * as controller from '../controllers/productController';
import { validateProduct } from '../middleware/validateProduct';

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', validateProduct(false), controller.create);   // all fields required
router.patch('/:id', validateProduct(true), controller.update); // partial
router.delete('/:id', controller.remove);

export default router;

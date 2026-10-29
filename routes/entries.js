import { Router } from 'express';
import * as entriesController from '../controllers/entriesController.js';
import { asyncHandler } from '../asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(entriesController.index));
router.get('/:id', asyncHandler(entriesController.show));
router.post('/', asyncHandler(entriesController.create));
router.post('/classic', asyncHandler(entriesController.createClassic));
router.put('/:id', asyncHandler(entriesController.update));
router.patch('/:id/pin', asyncHandler(entriesController.pin));
router.delete('/:id', asyncHandler(entriesController.destroy));

export default router;
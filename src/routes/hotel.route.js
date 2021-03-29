import express from 'express';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import HotelController from '../controllers/hotel.controller.js';

const router = express.Router();

router.get('/all/:search?', HotelController.getAll);

router.get('/:search?', HotelController.getOne);

router.post('/', AuthMiddleware.isAppAdmin, HotelController.add);

export default router;
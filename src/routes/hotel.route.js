import express from 'express';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import HotelController from '../controllers/hotel.controller.js';

const router = express.Router();

router.get('/reservation', AuthMiddleware.isHotelAdmin, HotelController.getReservations);

router.get('/all/:search?', HotelController.getAll);

router.get('/:search?', HotelController.getOne);

router.get('/user/:id', AuthMiddleware.isHotelAdmin, HotelController.getUserByHotel)

router.get('/:id/room', AuthMiddleware.isClient, HotelController.getRoomsByHotel);

router.get('/:id/event', AuthMiddleware.isClient, HotelController.getEventsByHotel);

router.post('/', AuthMiddleware.isAppAdmin, HotelController.add);

router.post('/room', AuthMiddleware.isAppAdmin, HotelController.addRoom);

router.post('/:id/service', AuthMiddleware.isAppAdmin, HotelController.addService);

router.post('/reservation/:id/service', AuthMiddleware.isClient, HotelController.addServiceToReservation)

router.post('/event', AuthMiddleware.isAppAdmin, HotelController.addEvent);

router.post('/:hotel/room/:room/reservation', AuthMiddleware.isClient, HotelController.addReservation);

export default router;
import express from 'express';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import HotelController from '../controllers/hotel.controller.js';

const router = express.Router();

router.get('/bestsellers', AuthMiddleware.isAppAdmin, HotelController.getBestSellers);

router.get('/reservation', AuthMiddleware.isHotelAdmin, HotelController.getReservations);

router.get('/reservation/user', AuthMiddleware.isClient, HotelController.getReservationsByUser);

router.get('/:hotel/reservation', AuthMiddleware.isAppAdmin, HotelController.getReservationsAdmin);

router.get('/all/:search?', HotelController.getAll);

router.get( '/room/all', HotelController.getAllRooms )

router.get('/:search?', HotelController.getOne);

router.put('/:id/like', AuthMiddleware.isLogged, HotelController.addLike);

router.put('/:id/dislike', AuthMiddleware.isLogged, HotelController.addDislike);

router.put('/room/:room/reservation/:reservation/status', AuthMiddleware.isClient, HotelController.editReservationStatus)

router.delete('/room/:room/reservation/:reservation', AuthMiddleware.isClient, HotelController.deleteReservation)

router.get('/user/:id', AuthMiddleware.isHotelAdmin, HotelController.getUserByHotel)

router.get('/:id/room', AuthMiddleware.isClient, HotelController.getRoomsByHotel);

router.get('/:id/event', AuthMiddleware.isClient, HotelController.getEventsByHotel);

router.post('/', AuthMiddleware.isAppAdmin, HotelController.add);

router.post('/room', AuthMiddleware.isAppAdmin, HotelController.addRoom);

router.post('/:id/service', AuthMiddleware.isHotelAdmin, HotelController.addService);

router.post('/reservation/:id/service', AuthMiddleware.isClient, HotelController.addServiceToReservation)

router.post('/event', AuthMiddleware.isAppAdmin, HotelController.addEvent);

router.post('/:hotel/room/:room/reservation', AuthMiddleware.isClient, HotelController.addReservation);

router.post('/room/availability', AuthMiddleware.isHotelAdmin, HotelController.roomAvailability);

router.delete('/:id', AuthMiddleware.isAppAdmin, HotelController.deleteHotel)

export default router;
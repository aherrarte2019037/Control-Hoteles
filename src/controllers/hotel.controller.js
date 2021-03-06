import HotelService  from '../services/hotel.service.js';

export default class HotelController {

    static async add( req, res ) {
        try {
            const data = req.body;
            const admin = req.body.admin;
            const response = await HotelService.add( data, admin );
            res.status(200).send(response);
            
        } catch (error) {
            res.status(200).send({ added: false, error: error.message? error.message : error });
        }
    }

    static async getAll( req, res ) {
        try {
            const { search } = req.params;
            const response = await HotelService.getAll( search );
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

    static async getAllRooms( req, res ) {
        try {
            const response = await HotelService.getAllRooms();
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

    static async getOne( req, res ) {
        try {
            const { search } = req.params;
            const response = await HotelService.getOne( search );
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

    static async addRoom( req, res ) {
        try {
            const { hotel, room } = req.body;
            const response = await HotelService.addRoom( hotel, room );
            res.status(200).send(response);

        } catch (error) {
            res.status(200).send({ added: false, error: error.message? error.message : error });
        }
    }

    static async addService( req, res ) {
        try {
            const hotel = req.params.id;
            const service = req.body.service;
            const response = await HotelService.addService( hotel, service );
            res.status(200).send(response);

        } catch (error) {
            res.status(200).send({ added: false, error: error.message? error.message : error });
        }
    }

    static async addServiceToReservation( req, res ) {
        try {
            const reservation = req.params.id;
            const { service, quantity, user } = req.body;
            const response = await HotelService.addServiceToReservation( reservation, service, quantity, user );
            res.status(200).send(response);

        } catch (error) {
            res.status(200).send({ added: false, error: error.message? error.message : error });
        }
    }

    static async addEvent( req, res ) {
        try {
            const { hotel, event } = req.body;
            const response = await HotelService.addEvent( hotel, event );
            res.status(200).send(response)

        } catch (error) {
            res.status(200).send({ added: false, error: error.message? error.message : error });
        }
    }

    static async addReservation( req, res ) {
        try {
            const { hotel, room } = req.params;
            const user = req.body.user.id;
            const reservation = req.body;
            const response = await HotelService.addReservation( hotel, room, user, reservation );
            res.status(200).send(response);

        } catch (error) {
            res.status(200).send({ added: false, error: error.message? error.message : error });
        }
    }

    static async getRoomsByHotel( req, res ) {
        try {
            const hotel  = req.params.id;
            const response = await HotelService.getRoomsByHotel( hotel );
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

    static async getEventsByHotel( req, res ) {
        try {
            const hotel  = req.params.id;
            const response = await HotelService.getEventsByHotel( hotel );
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

    static async getReservations( req, res ) {
        try {
            const { user } = req.body;
            const response = await HotelService.getReservations( user );
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

    static async getReservationsAdmin( req, res ) {
        try {
            const hotel = req.params.hotel;
            const response = await HotelService.getReservationsByHotel( hotel );
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

    static async getReservationsByUser( req, res) {
        try {
            const user = req.body.user.id;
            const response = await HotelService.getReservationsByUser( user );
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

    static async getUserByHotel( req, res ) {
        try {
            const user  = req.params.id;
            const admin = req.body.user;
            const response = await HotelService.getUserByHotel( user, admin );
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

    static async roomAvailability( req, res ) {
        try {
            const { entryDateTime, exitDateTime, user }  = req.body;
            const response = await HotelService.roomAvailability( entryDateTime, exitDateTime, user );
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

    static async getBestSellers( req, res ) {
        try {
            const response = await HotelService.getBestSellers();
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

    static async addLike( req, res ) {
        try {
            const id = req.params.id;
            const response = await HotelService.addLike( id );
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

    static async addDislike( req, res ) {
        try {
            const id = req.params.id;
            const response = await HotelService.addDislike( id );
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

    static async editReservationStatus( req, res ) {
        try {
            const { room, reservation } = req.params;
            const { cancelled, user } = req.body;

            const response = await HotelService.editReservationStatus( cancelled, room, reservation, user );
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

    static async deleteReservation( req, res ) {
        try {
            const { room, reservation } = req.params;

            const response = await HotelService.deleteReservation( room, reservation );
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

    static async deleteHotel( req, res ) {
        try {
            const hotel = req.params.id;
            const user = req.body.user;

            const response = await HotelService.deleteHotel( hotel, user );
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

}
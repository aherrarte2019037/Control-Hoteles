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

    static async getOne( req, res ) {
        try {
            const { search } = req.params;
            const response = await HotelService.getOne( search );
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

}
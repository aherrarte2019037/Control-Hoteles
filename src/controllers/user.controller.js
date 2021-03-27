import UserService from '../services/user.service.js';

export default class UserController {

    static async register( req, res ) {
        try {
            const data = req.body;
            const response = await UserService.register(data);
            res.status(200).send(response);

        } catch (error) {
            res.status(200).send({ registered: false, error: error.message? error.message : error });
        }
    }

    static async updateById( req, res ) {
        try {
            const id = req.body.user.id;
            const update = req.body.update;
            const response = await UserService.updateById( id, update );
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ updated: false, error: error.message? error.message : error });

        }
    }

    static async deleteById( req, res ) {
        try {
            const id = req.body.user.id;
            const response = await UserService.deleteById( id );
            res.status(200).send(response);
            
        } catch (error) {
            res.status(500).send({ deleted: false, error: error.message? error.message : error });
        }
    }

    static async getAll( req, res ) {
        try {
            const response = await UserService.getAll();
            res.status(200).send(response);

        } catch (error) {
            res.status(500).send({ error: error.message? error.message : error });
        }
    }

}
import UserService from '../services/user.service.js';

export default class UserController {

    static async register( req, res ) {
        try {
            const response = UserService.register();
            
        }catch (error) {
            
        }
    }

}
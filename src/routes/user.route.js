import express from 'express';
import UserController from '../controllers/user.controller.js';
import passport from 'passport';
import AuthMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', AuthMiddleware.isAppAdmin, UserController.getAll);

router.post('/register', AuthMiddleware.registerUser, UserController.register);

router.post('/login', (req, res) =>{

    if( !req.body.password || !req.body.email ) return res.status(500).send({ logged: false, error: 'Missing credentials' });

    passport.authenticate( 'authenticate_user', {session: false}, (error, user, message) =>{
        
        if(error || !user) {
            res.status(500).send(message);

        } else {
            res.status(200).send(message);
        }

    })(req, res);
    
});

router.put('/', AuthMiddleware.isLogged, UserController.updateById);

router.delete('/', AuthMiddleware.isLogged, UserController.deleteById);

export default router;
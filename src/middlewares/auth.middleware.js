import passport from 'passport';

export default class AuthMiddleware {

    static registerUser( req, res, next ) {
        if( req.body.role === 'hotel_admin' || req.body.role === 'app_admin' ) {
            passport.authenticate( 'authorize_user', {session: false}, (error, user, message) =>{

                if(error || !user || user.role === 'client') {
                    return res.status(500).send('Unauthorized');
        
                } else if (req.body.role === 'app_admin' && user.role !== 'app_admin') {
                    return res.status(500).send('Unauthorized');

                } else if (req.body.role === 'hotel_admin' && user.role !== 'app_admin' ) {
                    return res.status(500).send('Unauthorized');
                }

                next();
        
            })(req, res, next);

        } else {
            next();
        }
    }

    static isLogged( req, res, next ) {
        passport.authenticate( 'authorize_user', {session: false}, (error, user, message) =>{

            if(error || !user ) {
                res.status(500).send('Unauthorized');
        
            } else {
                req.body.user = user;
                next();
            }
        
        })(req, res, next);
    }

    static isAppAdmin( req, res, next ) {
        passport.authenticate( 'authorize_user', {session: false}, (error, user, message) =>{

            if(error || !user || user.role !== 'app_admin' ) {
                res.status(500).send('Unauthorized');
        
            } else {
                req.body.user = user;
                next();
            }
        
        })(req, res, next);
    }

}
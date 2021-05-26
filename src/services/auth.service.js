import Passport from 'Passport';
import PassportJwt from 'Passport-jwt';
import Jwt from 'jsonwebtoken';
import { Strategy } from 'Passport-local';
import UserModel from '../models/user.model.js';

const SECRET = 'secret_key'


const AuthFields = {
    usernameField: 'email',
    passwordField: 'password'
};


const Options = {
    jwtFromRequest: PassportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET
}


Passport.use( 'authenticate_user', new Strategy( AuthFields, async(email, password, done) =>{

    try {
        const user = await UserModel.findOne({ email: email });
        if( !user ) return done(null, false, { logged: false, error: 'Email unregistered' });
        if( !await user.validPassword(password) ) return done(null, false, { logged: false, error: 'Wrong email or password' });
        return done(null, user, { logged: 'true', item: user, jwt: getUserToken(user) });

    } catch(error) {
        return done(null, false, { error: error });
    }

}));

Passport.use( 'authorize_user', new PassportJwt.Strategy( Options, async(jwtPayload, done) =>{
    try {
        const user = await UserModel.findById( jwtPayload.sub );
        user.password = undefined;
        return done( null, user, { authorized: true } );

    } catch(error) {
        return done(error, false, { authorized: false, error: error })
    }

}));


function getUserToken( user ) {
    return Jwt.sign({
        sub : user.id,
        role: user.role
    }, SECRET);
};
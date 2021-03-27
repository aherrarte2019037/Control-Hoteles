import express from 'express';
import UserRoutes from './routes/user.route.js';
import connectDB from './db.js';
import passport from 'passport';
import UserService from './services/user.service.js';
import './services/auth.service.js';

passport.initialize();

const app = express();
const port = 3000;

app.use( express.json() );
app.use( express.urlencoded({ extended: true }) );

connectDB();

app.use( '/user', UserRoutes );

app.listen( 3000, () => {
    console.log(`Servidor en el puerto ${port}`);
    UserService.createAdmin();
});
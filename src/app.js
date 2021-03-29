import express from 'express';
import UserRoutes from './routes/user.route.js';
import HotelRoutes from './routes/hotel.route.js';
import connectDB from './db.js';
import Passport from 'Passport';
import UserService from './services/user.service.js';
import RouteMiddleware from './middlewares/route.middleware.js';
import cors from 'cors';
import './services/auth.service.js';

Passport.initialize();

const app = express();
const port = 3000;

app.use(cors());
app.use( express.json() );
app.use( express.urlencoded({ extended: true }) );

connectDB();

app.use( '/user', UserRoutes );
app.use( '/hotel', HotelRoutes );
app.use( RouteMiddleware.invalidRoute );

app.listen( 3000, () => {
    console.log(`Servidor en el puerto ${port}`);
    UserService.createAdmin();
});
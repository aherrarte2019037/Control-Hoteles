import express from 'express';
import UserRoutes from './routes/user.routes.js';
import connectDB from './db.js';

const app = express();
const port = 3000;

app.use( express.json() );
app.use( express.urlencoded({ extended: true }) );

connectDB();

app.use( '/user', UserRoutes );

app.listen( 3000, () => {
    console.log(`Servidor en el puerto ${port}`);
});
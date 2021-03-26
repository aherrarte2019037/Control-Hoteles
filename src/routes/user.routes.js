import express from 'express';
import UserController from '../controllers/user.controller.js';

const Router = express.Router();

Router.post('/register', UserController.register);

export default Router;
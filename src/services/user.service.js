import UserModel from '../models/user.model.js';
import RoomModel from '../models/room.model.js';
import HotelModel from '../models/hotel.model.js';
import BillModel from '../models/bill.model.js';
import mongoose from 'mongoose';

export default class UserService {

    static async createAdmin() {
        const userRepeat = await UserModel.findOne({ username: 'AppAdmin' });
        if( !userRepeat ) await UserModel.create({ username: 'AppAdmin', role: 'app_admin', email: 'app@admin.com', password: 'AdminPass12', firstname: 'App', lastname: 'Admin' });
    }

    static async register( user ) {
        const newUser = await UserModel.create({ ...user });
        return { registered: true, user: newUser }
    }

    static async registerHotelAdmin( user ) {
        const newUser = await UserModel.create({ ...user });
        return { registered: true, user: newUser }
    }

    static async updateById( id, update ) {
        if( !update || Object.keys(update).length === 0 ) return { updated: false, error: 'Data to update not found' };

        delete update.password;
        delete update.role;
        const userEdited = await UserModel.findByIdAndUpdate( id, update, { runValidators: true, context: 'query' } );
        
        if( !userEdited ) return { updated: false, error: 'Id invalid or not found' };
        return { updated: true, item: userEdited };
    }

    static async deleteById( id ) {
        const userDeleted = await UserModel.findByIdAndDelete( id );
        if( !userDeleted ) return { deleted: false, error: 'Id invalid or not found' };

        return { deleted: true, item: userDeleted };
    }

    static async getAll() {
        const users = await UserModel.find({});
        if( !users || users.length === 0 ) return { error: 'Users not found' };

        return users;
    }

    static async getOneByRole( user, role ) {
        const id = mongoose.Types.ObjectId( mongoose.isValidObjectId(user)? user:'000000000000' );
        const foundUser = await UserModel.findOne().and([
            { role: role },
            { $or: [{username: new RegExp(`^${user}$`, 'i')}, {_id: id}] }
        ]);
        
        if( !foundUser ) return { error: 'User not found' };
        return foundUser;
    }

    static async getHistory( user ) {
        const history = await HotelModel.find({}, 'name').populate({ path: 'rooms', select: { pricePerHour: 0, __v: 0 }, match: { 'reservations.user': user._id }, populate: { path: 'reservations.services._id', select: { price: 0, __v: 0 } } });
        return history;
    }

    static async getServicesByReservation( user, reservation, room ) {
        const history = await HotelModel.find({}, 'name').populate({ path: 'rooms', select: { pricePerHour: 0, __v: 0 }, match: { 'reservations.user': user._id }, populate: { path: 'reservations.services._id', select: { price: 0, __v: 0 } } });
        
        let foundRoom;
        history.forEach( data => {
            data.rooms.forEach( r => {
                if(r._id.toString() === room.toString()) foundRoom = r;
            })
        });

        let foundReservation;
        foundRoom.reservations.forEach( data => {
            if( data._id.toString() === reservation.toString() ) foundReservation = data;
        });

        const services = foundReservation?.services;

        if( !services ) return { error: 'Services not found' }

        return services;
    }

    static async getAdminHotelUnassigned() {
        const usersAdmin = ( await HotelModel.find({}, 'admin -_id')).map( user => user.admin.toString() );
        const users = (await UserModel.find({}, '_id')).map( user => user.id );

        //Usuarios administradores de hotel que no estan asignados
        const unassignedIds = users.filter( el => !usersAdmin.includes(el) ); 
        const unassignedUsers = await UserModel.find({ $and: [ {_id: { "$in" : unassignedIds}, role: 'hotel_admin'} ] })

        return unassignedUsers;
    }

    static async addBill( user, reservation ) {
        reservation = mongoose.Types.ObjectId( mongoose.isValidObjectId(reservation)? reservation:'000000000000' );
        user = mongoose.Types.ObjectId( mongoose.isValidObjectId(user)? user:'000000000000' );

        const { reservations, pricePerHour } = await RoomModel.findOne({ $and: [{ 'reservations._id': reservation }, { 'reservations.user': user }] }, 'reservations pricePerHour').populate('reservations.services._id')
        const existsReservation = reservations?.find( r => r.user = user );
        if( !reservations || !existsReservation ) return { added: false, error: 'Reservation or user not' };

        const servicesInfo = existsReservation.services.map( s => {
            return { quantity: s.quantity, price: s._id.price }
        });
         const total = getTotal( pricePerHour, existsReservation, servicesInfo );

        const bill = await BillModel.create({ _id: existsReservation._id, total: total, reservation: existsReservation });
        await bill.populate('reservation.services._id', '-description -__v').execPopulate();

        return { added: true, bill };
    }

    static async getById( id ) {
        const user = await UserModel.findById( id );
        if( !user || user.length === 0 ) return { error: 'User not found' };

        return user;
    }

}

function getTotal( roomPrice, reservationInfo, servicesInfo ) {
    const hours = reservationInfo.exitDateTime.getTime() - reservationInfo.entryDateTime.getTime();
    roomPrice = ((hours/(3600000) * roomPrice).toFixed(2));

    let servicesPrice = 0;
    servicesInfo.forEach( s => servicesPrice = servicesPrice + (s.quantity * s.price) );
    return servicesPrice + roomPrice;
}


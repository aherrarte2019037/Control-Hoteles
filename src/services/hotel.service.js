import HotelModel from "../models/hotel.model.js"
import UserService from '../services/user.service.js';
import RoomModel from '../models/room.model.js';
import ServiceModel from '../models/service.model.js';
import mongoose from 'mongoose';
import UserModel from "../models/user.model.js";
import { format } from "date-fns";

export default class HotelService {

    static async add( hotel, admin ) {
        const adminUser = await UserService.getOneByRole( admin, 'hotel_admin' );
        if( !adminUser || adminUser.error ) return { added: false, error: 'Hotel admin not found' };

        hotel.admin = adminUser.id;
        const newHotel= await HotelModel.create({ ...hotel });

        await newHotel.populate('admin', 'username email firstname lastname').execPopulate();
        return { added: true, hotel: newHotel };
    }

    static async getAll( search = null ) {
        let hotels;
        if( !search ) {
            hotels = await HotelModel.find({}).select({ admin: 0 }).populate('rooms services')

        } else {
            search = search.trim();
            const regex = new RegExp(`${search}`, 'i');
            hotels = await HotelModel.find({ $or: [{ name: regex }, { country: regex }, { city: regex }, { address: regex }] });
        }

        if( !hotels || hotels.length === 0 ) return { error: 'Hotels not found' };

        return hotels.reverse();
    }

    static async getAllRooms() {
        const rooms = await HotelModel.find({}, 'rooms _id name country city address stars').populate('rooms');
        if( !rooms || rooms.length === 0 ) return { error: 'Rooms not found' }

        let result;
        rooms.forEach( data => {
            result = data.rooms.map( room => {
                return {room, hotel: { name: data.name, _id: data._id, country: data.country, city: data.city, address: data.address, stars: data.stars }}
            })
        })

        return result.reverse();
    }

    static async getOne( search = null ) {
        let hotel;
        if( !search ) {
            hotel = await HotelModel.findOne({}).select({ admin: 0 });

        } else {
            const admin = mongoose.Types.ObjectId( mongoose.isValidObjectId(search)? search:'000000000000' );
            search = search.trim();
            const regex = new RegExp(`${search}`, 'i');
            hotel = (await HotelModel.findOne({ $or: [{ name: regex }, { country: regex }, { city: regex }, { address: regex }, { admin: admin }] }).populate('services'))
        }

        if( !hotel || hotel.length === 0 ) return { error: 'Hotel not found' };

        return hotel;
    }

    static async getRoomsByHotel( hotel ) {
        const id = mongoose.Types.ObjectId( mongoose.isValidObjectId(hotel)? hotel:'000000000000' );
        const hotelRooms = await HotelModel.findById(id).populate('rooms');
        if( !hotelRooms || hotelRooms.length === 0 ) return { error: 'Hotel not found' }

        return { rooms: hotelRooms.rooms, hotel: hotelRooms.name, address: hotelRooms.fullAddress };
    }

    static async getEventsByHotel( hotel ) {
        const id = mongoose.Types.ObjectId( mongoose.isValidObjectId(hotel)? hotel:'000000000000' );
        const hotelEvents = await HotelModel.findById(id);
        if( !hotelEvents || hotelEvents.length === 0 ) return { error: 'Hotel not found' }

        return { events: (hotelEvents.toJSON()).events, hotel: hotelEvents.name, address: hotelEvents.fullAddress };
    }

    static async getReservations( hotelAdmin ) {
        const id = mongoose.Types.ObjectId( mongoose.isValidObjectId(hotelAdmin.id)? hotelAdmin.id:'000000000000' );
        const hotel = await HotelModel.findOne({ admin: id }).populate('rooms');
        if( !hotel || hotel.length === 0 ) return { error: 'Hotel reservations not found' };

        return hotel.rooms
    }

    static async getReservationsByHotel( hotel ) {
        const id = mongoose.Types.ObjectId( mongoose.isValidObjectId(hotel)? hotel:'000000000000' );
        const existsHotel = await HotelModel.findOne({ $or: [{ _id: id }, { name: new RegExp(`${hotel}`, 'i') }] }).populate('rooms');
        if( !existsHotel || existsHotel.length === 0 ) return { error: 'Hotel not found' };
        if( existsHotel.rooms.length === 0 || existsHotel.rooms.reservations?.length === 0 ) return { error: 'Reservations not found' };

        return existsHotel;
    }

    static async getReservationsByUser( user ) {
        const id = mongoose.Types.ObjectId( mongoose.isValidObjectId(user)? user:'000000000000' );
        const hotels = await HotelModel.find().populate('rooms')
        if( !hotels || hotels.length === 0 ) return { error: 'Reservations not found' };

        let filterReservations = [];
        hotels.forEach(  hotel => hotel.rooms.forEach( r => r.reservations.forEach( reservation => {
            if( reservation.user.toString() === user ) filterReservations.push({ hotel: hotel.name, description: hotel.description, address: hotel.address, country: hotel.country, room: r.name, roomId: r.id, pricePerHour: r.pricePerHour, reservation });
        })));

        return filterReservations;
    }

    static async getBestSellers(  ) {
        const bestSellers = await HotelModel.find({}, '-services -events').sort({ reservations: -1 }).limit( 3 ).populate('rooms')
        if( !bestSellers || bestSellers.length === 0 ) return { error: 'Hotels not found' };

        return bestSellers;
    }

    static async addRoom( hotel, room = {} ) {
        if( !hotel || Object.keys(room).length === 0 ) return { added: false, error: 'Missing data' };

        const id = mongoose.Types.ObjectId( mongoose.isValidObjectId(hotel)? hotel:'000000000000' );
        let existsHotel = await HotelModel.findOne({ $or: [{name: new RegExp(`^${hotel}$`, 'i')}, {_id: id}] });
        if( !existsHotel ) return { added: false, error: 'Hotel not found' };
        
        const newRoom = await RoomModel.create(room);
        if( Array.isArray(newRoom) ) newRoom.map( room => existsHotel.rooms.push(room.id) );
        if( !Array.isArray(newRoom) ) existsHotel.rooms.push(newRoom.id);
        
        const result = await (await existsHotel.save({validateBeforeSave: false})).populate('rooms').execPopulate();
        return { added: true, hotel: result };
    }

    static async addService( hotel, service = {} ) {
        if( Object.keys(service).length === 0 ) return { added: false, error: 'Missing data' };

        const id = mongoose.Types.ObjectId( mongoose.isValidObjectId(hotel)? hotel:'000000000000' );
        let existsHotel = await HotelModel.findOne({ $or: [{name: new RegExp(`^${hotel}$`, 'i')}, {_id: id}, {admin: id}] });
        if( !existsHotel ) return { added: false, error: 'Hotel not found' };
        
        const newService = await ServiceModel.create(service);
        if( Array.isArray(newService) ) newService.map( service => existsHotel.services.push(service.id) );
        if( !Array.isArray(newService) ) existsHotel.services.push(newService.id);

        const result = await (await existsHotel.save({ validateBeforeSave: false })).populate('services', 'name description price').execPopulate();
        return { added: true, hotel: result };
    }

    static async addServiceToReservation( reservation, service, quantity = 1, user ) {
        if( !reservation || !service ) return { added: false, error: 'Missing data' };
        if( quantity <= 0 || isNaN(quantity) ) return { added: false, error: 'Quantity invalid' };

        reservation = mongoose.Types.ObjectId( mongoose.isValidObjectId(reservation)? reservation:'000000000000' );
        service = mongoose.Types.ObjectId( mongoose.isValidObjectId(service)? service:'000000000000' );

        const existsService = await HotelModel.findOne({ services: service }, 'services');
        if( !existsService ) return { added: false, error: 'Service not found' };

        const existsReservation = await RoomModel.findOne({ $and: [{ 'reservations._id': reservation }, { 'reservations.user': user._id }] }, 'reservations');
        if( !existsReservation ) return { added: false, error: 'Reservation not found' };

        const foundReservation = existsReservation.reservations.find( r => reservation.equals(r._id) );
        const includesService = foundReservation.services.some( s => service.equals(s.id) );

        if( includesService ) {
            for (const s of foundReservation.services) {
                if( service.equals(s.id)) { 
                    s.quantity = s.quantity + quantity;
                    break;
                };
            }

            await existsReservation.save();

            const result = JSON.parse(JSON.stringify(foundReservation));
            result.entryDateTime = format( foundReservation.entryDateTime, 'yyyy/MM/dd hh:mm:ss aa' );
            result.exitDateTime = format( foundReservation.entryDateTime, 'yyyy/MM/dd hh:mm:ss aa' );

            return { added: true, reservation: result};
        };

        foundReservation.services.push({ _id: service, quantity: quantity });
        await existsReservation.save();

        const result = JSON.parse(JSON.stringify(foundReservation));
        result.entryDateTime = format( foundReservation.entryDateTime, 'yyyy/MM/dd hh:mm:ss aa' );
        result.exitDateTime = format( foundReservation.entryDateTime, 'yyyy/MM/dd hh:mm:ss aa' );

        return { added: true, reservation: result };
    }

    static async addEvent( hotel, event = {} ) {
        if( !hotel || Object.keys(event).length === 0 ) return { added: false, error: 'Missing data' };

        const id = mongoose.Types.ObjectId( mongoose.isValidObjectId(hotel)? hotel:'000000000000' );
        let existsHotel = await HotelModel.findOne({ $or: [{name: new RegExp(`^${hotel}$`, 'i')}, {_id: id}] });
        if( !existsHotel ) return { added: false, error: 'Hotel not found' };
        
        if( Array.isArray(event) ) event.map( e => existsHotel.events.push(e) );
        if( !Array.isArray(event) ) existsHotel.events.push(event);

        const result = await existsHotel.save();

        return { added: true, events: result.events };
    }

    static async addReservation( hotel, room, user, reservation ) {
        if( !hotel || !reservation || !user || !room ) return { added: false, error: 'Missing data' };
        const hotelId = mongoose.Types.ObjectId( mongoose.isValidObjectId(hotel)? hotel:'000000000000' );
        const roomId = mongoose.Types.ObjectId( mongoose.isValidObjectId(room)? room:'000000000000' );

        const existsHotel = await HotelModel.findOne({ $or: [{name: new RegExp(`^${hotel}$`, 'i')}, {_id: hotelId}] });
        if( !existsHotel ) return { added: false, error: 'Hotel not found' };

        const existsRoom = await RoomModel.findOne({ $or: [{name: new RegExp(`^${room}$`, 'i')}, {_id: roomId}] });
        if( !existsRoom ) return { added: false, error: 'Room not found' };

        for (const r of existsRoom.reservations) {
            if( new Date(reservation.entryDateTime).toISOString() >= r.entryDateTime.toISOString() && new Date(reservation.entryDateTime).toISOString() <= r.exitDateTime.toISOString() ) return { added: false, error: 'Room reserved for entry datetime' };
            if( new Date(reservation.exitDateTime).toISOString() >= r.entryDateTime.toISOString() && new Date(reservation.exitDateTime).toISOString() <= r.exitDateTime.toISOString() ) return { added: false, error: 'Room reserved for entry datetime' };
        }

        existsHotel.reservations += 1;
        await existsHotel.save({validateBeforeSave: false});
        
        existsRoom.reservations.push({ ...reservation, user });
        await existsRoom.save();

        reservation.entryDateTime = format( new Date(reservation.entryDateTime), 'yyyy/MM/dd hh:mm:ss aa' );
        reservation.exitDateTime = format( new Date(reservation.exitDateTime), 'yyyy/MM/dd hh:mm:ss aa' );
        return { added: true, reservation, hotel: existsHotel.name };
    }

    static async getUserByHotel( user, admin ) {
        let client;

        if( mongoose.isValidObjectId(user) ) client = await UserModel.findOne({ $and: [{ _id: user }, { role: 'client' }] });
        if( !mongoose.isValidObjectId(user) ) client = await UserModel.findOne({ $and: [{ username: new RegExp(`${user}`, 'i') }, { role: 'client' }] });

        const hotel = await HotelModel.findOne({ admin: admin.id }).populate({ path: 'rooms', match: { "reservations.user": client?.id } });
        if( !hotel.rooms || hotel.rooms.length === 0 ) return { error: 'User not found in specified hotel' };

        let reservations = hotel.rooms.map( r => r.reservations );
        reservations = reservations[0];
        
        return { user: client, reservations}
    }

    static async roomAvailability( entryDateTime, exitDateTime, user ) {
        if( !entryDateTime || !exitDateTime ) return { error: 'Missing data' }
        const { rooms } = await HotelModel.findOne({ admin: user._id }, 'rooms').populate('rooms');

        const roomsAvailable = compareReservationsDate( entryDateTime, exitDateTime, rooms );
        if( !roomsAvailable || roomsAvailable.length === 0 ) return { error: 'No rooms available for specified datetimes' }

        return roomsAvailable;
    }

    static async addLike( id ) {
        const hotelUpdated = await HotelModel.findByIdAndUpdate( id, { $inc: { likes: 1 } } );
        return hotelUpdated;
    }

    static async addDislike( id ) {
        const hotelUpdated = await HotelModel.findByIdAndUpdate( id, { $inc: { dislikes: 1 } } );
        return hotelUpdated;
    }

    static async editReservationStatus( cancelled, room, reservation ) {
        if( cancelled === undefined || cancelled === null) return { statusUpdate: false, error: 'Missing data' };

        const reservationId = mongoose.Types.ObjectId( mongoose.isValidObjectId(reservation)? reservation:'000000000000' );
        const roomId = mongoose.Types.ObjectId( mongoose.isValidObjectId(room)? room:'000000000000' );

        const reservationUpdated = await RoomModel.findOneAndUpdate({ _id: roomId ,'reservations._id': reservationId }, { $set: { 'reservations.$.cancelled': cancelled } })

        return reservationUpdated;
    }

    static async deleteReservation( room, reservation ) {
        const reservationId = mongoose.Types.ObjectId( mongoose.isValidObjectId(reservation)? reservation:'000000000000' );
        const roomId = mongoose.Types.ObjectId( mongoose.isValidObjectId(room)? room:'000000000000' );

        const reservationDeleted = await RoomModel.findOneAndUpdate({ _id: roomId }, { $pull: { reservations: { _id: reservationId } } })
        
        return reservationDeleted;
    }

}

function compareReservationsDate( entryDateTime, exitDateTime, rooms ) {
    let roomsAvailable = []
    rooms.forEach( room => room.reservations.forEach( r =>  {
        if( new Date( entryDateTime ) >= r.exitDateTime && new Date( exitDateTime ) >= r.exitDateTime ) {
            roomsAvailable.push({ _id: room._id, name: room.name, pricePerHour: room.pricePerHour });
        }
    }));

    return roomsAvailable;
}
import HotelModel from "../models/hotel.model.js"
import UserService from '../services/user.service.js';
import RoomModel from '../models/room.model.js';
import ServiceModel from '../models/service.model.js';
import mongoose from 'mongoose';

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
            hotels = await HotelModel.find({}).select({ admin: 0 });

        } else {
            search = search.trim();
            const regex = new RegExp(`${search}`, 'i');
            hotels = await HotelModel.find({ $or: [{ name: regex }, { country: regex }, { city: regex }, { address: regex }] });
        }

        if( !hotels || hotels.length === 0 ) return { error: 'Hotels not found' };

        return hotels;
    }

    static async getOne( search = null ) {
        let hotel;
        if( !search ) {
            hotel = await HotelModel.findOne({}).select({ admin: 0 });

        } else {
            search = search.trim();
            const regex = new RegExp(`${search}`, 'i');
            hotel = await HotelModel.findOne({ $or: [{ name: regex }, { country: regex }, { city: regex }, { address: regex }] });
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

    static async addRoom( hotel, room = {} ) {
        if( !hotel || Object.keys(room).length === 0 ) return { added: false, error: 'Missing data' };

        const id = mongoose.Types.ObjectId( mongoose.isValidObjectId(hotel)? hotel:'000000000000' );
        let existsHotel = await HotelModel.findOne({ $or: [{name: new RegExp(`^${hotel}$`, 'i')}, {_id: id}] });
        if( !existsHotel ) return { added: false, error: 'Hotel not found' };
        
        const newRoom = await RoomModel.create(room);
        if( Array.isArray(newRoom) ) newRoom.map( room => existsHotel.rooms.push(room.id) );
        if( !Array.isArray(newRoom) ) existsHotel.rooms.push(newRoom.id);
        
        const result = await (await existsHotel.save()).populate('rooms').execPopulate();
        return { added: true, hotel: result };
    }

    static async addService( hotel, service = {} ) {
        if( !hotel || Object.keys(service).length === 0 ) return { added: false, error: 'Missing data' };

        const id = mongoose.Types.ObjectId( mongoose.isValidObjectId(hotel)? hotel:'000000000000' );
        let existsHotel = await HotelModel.findOne({ $or: [{name: new RegExp(`^${hotel}$`, 'i')}, {_id: id}] });
        if( !existsHotel ) return { added: false, error: 'Hotel not found' };
        
        const newService = await ServiceModel.create(service);
        if( Array.isArray(newService) ) newService.map( service => existsHotel.services.push(service.id) );
        if( !Array.isArray(newService) ) existsHotel.services.push(newService.id);

        const result = await (await existsHotel.save()).populate('services', 'name description price').execPopulate();
        return { added: true, hotel: result };
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

        hotel = mongoose.Types.ObjectId( mongoose.isValidObjectId(room)? room:'000000000000' );
        room = mongoose.Types.ObjectId( mongoose.isValidObjectId(room)? room:'000000000000' );

        const existsHotel = await HotelModel.findOne({ $or: [{name: new RegExp(`^${hotel}$`, 'i')}, {_id: id}] });
        if( !existsHotel ) return { added: false, error: 'Hotel not found' };

        const result = await existsHotel.save();

        return { added: true, events: result.events };
    }

}
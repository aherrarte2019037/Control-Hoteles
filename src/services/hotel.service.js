import HotelModel from "../models/hotel.model.js"
import UserService from '../services/user.service.js';

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
        if( !search ) hotels = await HotelModel.find({}).select({ admin: 0 });

        search = search.trim();
        const regex = new RegExp(`${search}`, 'i');

        hotels = await HotelModel.find({ $or: [{ name: regex }, { country: regex }, { city: regex }, { address: regex }] });
        if( !hotels || hotels.length === 0 ) return { error: 'Hotels not found' };

        return hotels;
    }

    static async getOne( search = null ) {
        let hotel;
        if( !search ) hotel = await HotelModel.findOne({}).select({ admin: 0 });

        search = search.trim();
        const regex = new RegExp(`${search}`, 'i');

        hotel = await HotelModel.findOne({ $or: [{ name: regex }, { country: regex }, { city: regex }, { address: regex }] });
        if( !hotel || hotel.length === 0 ) return { error: 'Hotel not found' };

        return hotel;
    }

}
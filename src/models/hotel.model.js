import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { format } from "date-fns";

const HotelSchema = mongoose.Schema({
    name       : { type: String, required: [true, 'Name is required'], unique: true, uniqueCaseInsensitive: true },
    stars      : { type: Number, required: [true, 'Stars is required'], min: 1, max: 5 },
    description: { type: String, required: [true, 'Description is required'] },
    country    : { type: String, required: [true, 'Country is required'] },
    city       : { type: String, required: [true, 'City is required'] },
    address    : { type: String, required: [true, 'Address is required'], unique: true, uniqueCaseInsensitive: true },
    likes      : { type: Number, default: 0 },
    dislikes   : { type: Number, default: 0 },
    admin      : { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
    rooms      : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
    services   : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    events     : [{
        name         : { type: String, required: [true, 'Event name is required'], unique: true, uniqueCaseInsensitive: true },
        type         : { type: String, enum: ['Concierto', 'Fiesta', 'Deportivo', 'Cultural', 'Corporativo', 'Otro'], required: [true, 'Event type is required'] },
        description  : { type: String, required: [true, 'Event description is required'] },
        start        : { type: Date, required: [true, 'Event start is required'], min: Date.now() },
        end          : { type: Date, required: [true, 'Event end is required'], min: Date.now() }
    }]
});

HotelSchema.virtual('fullAddress').get( function() {
    return this.address + ', ' + this.city + ', ' + this.country;
});

HotelSchema.plugin(uniqueValidator, { message: '{PATH} already exists' });

HotelSchema.methods.toJSON = function() {
    const hotel = this;
    const response = hotel.toObject();

    if( response.rooms?.reservations ) {
        response.rooms.map( room => room.reservations.map( r => r.entryDateTime = format(r.entryDateTime, 'yyyy/MM/dd hh:mm:ss aa') ) );
        response.rooms.map( room => room.reservations.map( r => r.exitDateTime = format(r.exitDateTime, 'yyyy/MM/dd hh:mm:ss aa') ) );
    }
    if( response.events ) {
        response.events.map( event => event.start = format( event.start, 'yyyy/MM/dd hh:mm:ss aa' ));
        response.events.map( event => event.end = format( event.end, 'yyyy/MM/dd hh:mm:ss aa' ));
    }
    
    delete response.__v;
    return response;
};

export default mongoose.model( 'Hotel', HotelSchema );
import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { format } from "date-fns";

const RoomSchema = mongoose.Schema({
    name         : { type: String, required: [true, 'Name is required'], unique: true, uniqueCaseInsensitive: true },
    pricePerHour : { type: Number, required: [true, 'Priceperhour is required'], min: 1 },
    reservations : [{
        user         : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'User is required'] },
        entryDateTime: { type: Date, required: [true, 'Entry DateTime is required'] },
        exitDateTime : { type: Date, required: [true, 'Exit DateTime is required'] },
        cancelled    : { type: Boolean, default: false},
        invoiced     : { type: Boolean, default: false},
        services     : [{ 
            _id      : { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
            quantity : { type: Number, min: 1, default: 1 }
        }]
    }]
});

RoomSchema.methods.toJSON = function() {
    const room = this;
    const response = room.toObject();
    response.reservations.map( reservation => reservation.entryDateTime = format( reservation.entryDateTime, 'yyyy/MM/dd hh:mm:ss aa' ));
    response.reservations.map( reservation => reservation.exitDateTime = format( reservation.exitDateTime, 'yyyy/MM/dd hh:mm:ss aa' ));
    delete response.__v;
    return response;
};

RoomSchema.plugin(uniqueValidator, { message: '{PATH} already exists' });

export default mongoose.model( 'Room', RoomSchema );
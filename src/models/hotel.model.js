import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

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
    rooms      : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }]
});

HotelSchema.virtual('fullAddress').get( function() {
    return this.address + ', ' + this.city + ', ' + this.country;
});

HotelSchema.plugin(uniqueValidator, { message: '{PATH} already exists' });

HotelSchema.methods.toJSON = function() {
    const hotel = this;
    const response = hotel.toObject();
    delete response.__v;
    return response;
};

export default mongoose.model( 'Hotel', HotelSchema );
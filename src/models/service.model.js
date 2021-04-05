import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const ServiceSchema = mongoose.Schema({
    name       : { type: String, required: [true, 'Name is required'], unique: true, uniqueCaseInsensitive: true },
    description: { type: String, required: [true, 'Description is required'] },
    price      : { type: Number, required: [true, 'Price is required'], min: 1 }
});

ServiceSchema.plugin(uniqueValidator, { message: '{PATH} already exists' });

ServiceSchema.methods.toJSON = function() {
    const service = this;
    const response = service.toObject();
    delete response.__v;
    return response;
};

export default mongoose.model( 'Service', ServiceSchema );
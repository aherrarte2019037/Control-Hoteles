import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { format } from "date-fns";

const BillSchema = mongoose.Schema({
    date       : { type: Date, default: Date.now(), min: Date.now() },
    total      : { type: Number, required: [true, 'Total is required'], min: 0 },
    reservation: {
        _id          : { type: mongoose.Schema.Types.ObjectId, unique: true },
        user         : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'User is required'] },
        entryDateTime: { type: Date, required: [true, 'Entry DateTime is required'] },
        exitDateTime : { type: Date, required: [true, 'Exit DateTime is required'] },
        services     : [{ 
            _id      : { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
            quantity : { type: Number, min: 1, default: 1 }
        }]
    }
});

BillSchema.methods.toJSON = function() {
    const bill = this;
    const response = bill.toObject();

    if( response?.date ) response.date = format(response.date, 'yyyy/MM/dd hh:mm:ss aa');

    if( response?.reservation ) {
        response.reservation.entryDateTime = format(response.reservation.entryDateTime, 'yyyy/MM/dd hh:mm:ss aa');
        response.reservation.exitDateTime = format(response.reservation.exitDateTime, 'yyyy/MM/dd hh:mm:ss aa');
    }
    
    delete response.__v;
    return response;
};

BillSchema.plugin(uniqueValidator, { message: '{PATH} already exists' });


export default mongoose.model('Bill', BillSchema);


import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import uniqueValidator from 'mongoose-unique-validator';
import 'mongoose-type-email';

mongoose.SchemaTypes.Email.defaults.message = 'Email is invalid';

const UserSchema = mongoose.Schema({
    username : { type: String, required: [true, 'Username is required'], minLength: 4, maxLength: 30, unique: true, uniqueCaseInsensitive: true },
    email    : { type: mongoose.SchemaTypes.Email, unique: true, uniqueCaseInsensitive: true },
    firstname: { type: String, required: [true, 'Firstname is required'], minLength: 2, maxLength: 30 },
    lastname : { type: String, required: [true, 'Lastname is required'], minLength: 2, maxLength: 30 },
    role     : { type: String, enum: ['client', 'hotel_admin', 'app_admin'], default: 'client' },
    password : { type: String, required: [true, 'Password is required'], minLength: 5, maxLength: 30 }
});

UserSchema.plugin(uniqueValidator, { message: '{PATH} already exists' });

UserSchema.pre( 'save', async function(next) {
    const user = this;
    if( !user.isModified('password') ) return next(); 

    const hashPassword = await bcrypt.hash( user.password, 10 );
    user.password = hashPassword;
});

UserSchema.methods.validPassword = async function(password) {
    return await bcrypt.compare( password, this.password )
};

UserSchema.methods.toJSON = function() {
    const user = this;
    const response = user.toObject();
    delete response.password;
    delete response.__v;
    return response;
};

export default mongoose.model( 'User', UserSchema );
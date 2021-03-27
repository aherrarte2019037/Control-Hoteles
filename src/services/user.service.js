import UserModel from '../models/user.model.js';

export default class UserService {

    static async createAdmin() {
        const userRepeat = await UserModel.findOne({ username: 'AppAdmin' });
        if( !userRepeat ) await UserModel.create({ username: 'AppAdmin', role: 'app_admin', email: 'app@admin.com', password: '12345', firstname: 'App', lastname: 'Admin' });
    }

    static async register( user ) {
        const userRepeat = await UserModel.findOne({ $or: [{ username: user.username }, { email: user.email }] });
        if( userRepeat ) return { registered: false, error: 'Username or email already exists' };

        const newUser = await UserModel.create({ ...user });
        return { registered: true, user: newUser }
    }

    static async updateById( id, update ) {
        if( !update ) return { updated: false, error: 'Data not found' };

        delete update.password;
        delete update.role;
        const userEdited = await UserModel.findByIdAndUpdate( id, update );
        
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
        if( !users ) return { error: 'Users not found' };

        return users;
    }

}
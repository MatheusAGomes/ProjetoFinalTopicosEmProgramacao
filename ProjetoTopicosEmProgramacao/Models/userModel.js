const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserSchema = new Schema({
    id: ObjectId,
    email:String,
    senha:String,
    name:String,
    livros:[],
    log:[],
    statusPag:false,
});

const UserModel = mongoose.model('users',UserSchema);

module.exports = UserModel;
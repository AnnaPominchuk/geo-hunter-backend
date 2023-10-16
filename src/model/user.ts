const mongoose = require('mongoose')

// TO DO: use emun
const roleSchema = new mongoose.Schema({  value: {  type: String, enum: ['Admin','Activist'] } });

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    rating: Number,
    useGooglePhoto: Boolean,
    profilePhotoKey: String,
    profilePhotoURL: String,
    roles: {
        type: [String],
        default: ['Activist']
    }
}) 

module.exports = mongoose.model('User', UserSchema)
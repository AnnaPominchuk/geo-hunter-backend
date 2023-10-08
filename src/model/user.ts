const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    lastname: String,
    rating: Number,
    useGooglePhoto: Boolean,
    profilePhotoKey: String,
    profilePhotoURL: String
}) 

module.exports = mongoose.model('User', UserSchema)
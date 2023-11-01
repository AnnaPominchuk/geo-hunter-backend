const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    authId: {
        type: String,
        required: true,
        unique: true,
    },
    name: String,
    rating: Number,
    useGooglePhoto: Boolean,
    profilePhotoKey: String,
    profilePhotoURL: String,
    roles: {
        type: [String],
        enum: ['Admin', 'Activist'],
        default: ['Activist'],
    },
    blocked: {
        type: Boolean,
        default: false,
    }
})

module.exports = mongoose.model('User', UserSchema)

const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    lastname: String,
    rating: Number
}) 

module.exports = mongoose.model('User', UserSchema)
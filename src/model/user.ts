const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: String,
    lastname: String,
    rating: Number
}) 

module.exports = mongoose.model('User', UserSchema)
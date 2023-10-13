const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({  value: {  type: String, enum: ['Admin','Activist'] } });

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    lastname: String,
    rating: Number,
<<<<<<< Updated upstream
    useGooglePhoto: Boolean,
    profilePhotoKey: String,
    profilePhotoURL: String
=======
    roles: {
        type: [String],
        default: ['Activist']
    }
>>>>>>> Stashed changes
}) 

module.exports = mongoose.model('User', UserSchema)
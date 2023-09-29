const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
    name: String,
    latitude: Number,
    longitude: Number,
    review: String,
    shopId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Review', ReviewSchema)
const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
    name: String,
    latitude: Number,
    longitude: Number,
    review: String,
    status: {
        type: String,
        enum : ['InReview','Approved', 'Rejected'],
        default: 'InReview'
    },
    shopId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    rating: Number,
    images: {
        type: Array
    }
},{
    collection:'reviews',
    versionKey: false
})

module.exports = mongoose.model('Review', ReviewSchema)
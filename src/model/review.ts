const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema(
    {
        name: String,
        latitude: Number,
        longitude: Number,
        address: String,
        review: String,
        status: {
            type: String,
            enum: ['InReview', 'Approved', 'Rejected'],
            default: 'InReview',
        },
        shopId: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        rating: Number,
        images: {
            type: Array,
        },
        overallRating: {
            type: String,
            enum: ['Fine', 'MaybeSuspicious', 'ObviouslySuspicious'],
            default: 'Fine',
        },
        hasSupportBoard: Boolean,
        hasOpenHoursAdded: Boolean
    },
    {
        collection: 'reviews',
        versionKey: false,
    }
)

module.exports = mongoose.model('Review', ReviewSchema)

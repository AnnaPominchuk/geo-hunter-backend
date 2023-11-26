const mongoose = require('mongoose')

const ShopSchema = new mongoose.Schema({
    requestor: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    m_id: Number,
    t_id: Number,
    county_id: {
        type: Number,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: false,
    },
    hasSupportBoard: {
        type: Boolean,
        required: false,
    },
    hasOpenHoursAdded: {
        type: Boolean,
        required: false,
    },
    overallRating: {
        type: String,
        enum: ['Fine', 'MaybeSuspicious', 'ObviouslySuspicious'],
        default: 'Fine',
    },
})

module.exports = mongoose.model('Shop', ShopSchema)

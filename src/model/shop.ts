const mongoose = require('mongoose')

const ShopSchema = new mongoose.Schema({
    name: {
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
})

module.exports = mongoose.model('Shop', ShopSchema)

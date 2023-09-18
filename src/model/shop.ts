const mongoose = require('mongoose')

const ShopSchema = new mongoose.Schema({
    name: String,
    adress: String,
    amount: Number,
    m_id: Number,
    t_id: Number,
    county_id: Number,
    latitude: Number, 
    longitude: Number
})

module.exports = mongoose.model('Shop', ShopSchema)
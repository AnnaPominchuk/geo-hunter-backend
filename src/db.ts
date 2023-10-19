const mongoose = require('mongoose')
require('dotenv').config()

const URI = process.env.MONGODB_URI ? process.env.MONGODB_URI : ''

mongoose.connect(URI)

module.exports = mongoose


const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    title: String,
    image: String,
    price: Number,
    orgPrice: Number,
    rating: Number,
    category:String
})

module.exports = mongoose.model('product',productSchema)
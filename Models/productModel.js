
const mongoose = require('mongoose');

// mongoose.connect('mongodb://127.0.0.1:27017/testapp')


const productSchema = mongoose.Schema({
    title: String,
    image: String,
    price: Number,
    orgPrice: Number,
    rating: Number,
    category:String
})

module.exports = mongoose.model('product',productSchema)
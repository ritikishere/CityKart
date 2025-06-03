const mongoose = require('mongoose')


const cartItemSchema = mongoose.Schema({
    title: String,
    image: String,
    price: Number,
    orgPrice: Number,
    rating: Number,
    category:String
})

module.exports = mongoose.model('cartItem',cartSchema)
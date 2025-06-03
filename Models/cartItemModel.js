const mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/app1")


const cartItemSchema = mongoose.Schema({
    title: String,
    image: String,
    price: Number,
    orgPrice: Number,
    rating: Number,
    category:String
})

module.exports = mongoose.model('cartItem',cartSchema)

const mongoose = require('mongoose');

// mongoose.connect('mongodb://127.0.0.1:27017/testapp')


const productSchema = mongoose.Schema({
    title: String,
    image: String,
    price: Number,
    orgPrice: Number,
    category:String,
    starCounts:{
        type:Number,
        default:0
    },
    reviewno:{
        type:Number,
        default:0
    },
    rating:{
        type:Number,
        default:0
    },
    
    reviews: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            comment: String,
            stars: Number,
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]

})

module.exports = mongoose.model('product',productSchema)
const mongoose = require('mongoose');


const userSchema =  mongoose.Schema({
    firstName: String,
    lastName: String,
    image: {
        type: String,
        default: "/uploads/defaultprofile.jpeg"
    },
    contact: Number,
    password: String,
    email: String,
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }],
    orderlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    },
   
    ]

})

module.exports = mongoose.model('user',userSchema)
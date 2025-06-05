const express = require('express');
const path = require('path');
const app = express();
const productModel = require('./Models/productModel')
const userModel = require('./Models/userModel');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const auth = require('./auth.js')
const bcrypt = require('bcrypt')
const attachUser = require("./attachUser.js");
const wordList = require('./serchList.js')

// const mongoose = require('mongoose');



require('dotenv').config();




 const mongoose = require('mongoose');
 const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/testapp';
 mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true, }) .then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));








app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "Views"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')));
app.use(async (req, res, next) => {
  await attachUser(req, res, next);
});


app.get('/',async (req,res)=>{
    let products = await productModel.find()

    res.render('Home', {products})
})


app.post("/add-to-cart/:id", auth, async (req, res) => {

  const user = await userModel.findById(req.user.id)
  user.cart.push(req.params.id)
  await user.save()
  res.redirect("/cart")
    
  
})
app.post("/buy/:id", auth, async (req, res) => {
  const user = await userModel.findById(req.user.id);
  const product = await productModel.findById(req.params.id); 
  

  res.render("UserPanel/Buy", { product }); // Yeh line mein product bhejna zaroori hai
});

app.post("/place-order/:id", auth, async (req, res) => {
  
const user = await userModel.findById(req.user.id);
  const product = await productModel.findById(req.params.id); // Yeh line add karo
  const { name, state, district, city, pincode, payment } = req.body;

  user.orderlist.push(req.params.id);
  await user.save();
  res.render("UserPanel/receipt",{
     product,
    user,
    name,
    state,
    district,
    city,
    pincode,
    payment
  })
});





app.get("/signup", (req,res)=>{
    res.render('UserPanel/signup')
})



app.post("/createproduct", (req,res)=>{
    res.redirect("/addproduct")
})

app.get('/addproduct', (req,res)=>{
    res.render('AdminPanel/addProduct')
})


app.get('/productlist', async (req, res) => {
  let products = await productModel.find();
  let users = await userModel.find().populate('orderlist');

  // Flatten all orderlist products with respective user details
  let orders = [];
  users.forEach(user => {
    user.orderlist.forEach(product => {
      orders.push({
        user,
        product
      });
    });
  });

  res.render('AdminPanel/productList', {
    products,
    orders,
    users
  });
});


app.get('/delete/:id',async (req,res)=>{
    let deletedproducts = await productModel.findOneAndDelete({_id : req.params.id })
    res.redirect('/productlist')

})



app.post('/create', async (req,res)=>{
    let {title,image,price,orgPrice,rating,category} = req.body
    let createdProduct = await productModel.create({
        title,
        image,
        price,
        orgPrice,
        rating,
        category
    });

    res.redirect("/productlist")

    
})
app.post('/createuser', async (req,res)=>{
    let {firstName,lastName,email,contact,image,password} = req.body
    const hashed = await bcrypt.hash(password,10)
    let createdUser = await userModel.create({
        firstName,
        lastName,
        email,
        contact,
        image,
        password : hashed
    });

    res.redirect("/login")
    
})



app.get("/cart", auth, async (req,res)=>{
    const user = await userModel.findById(req.user.id).populate('cart')
    res.render('UserPanel/cart', {cart : user.cart,
        user: user,
    })
})
app.get("/orderlist", auth, async (req,res)=>{
    const user = await userModel.findById(req.user.id).populate('orderlist')

    res.render('UserPanel/orderlist', {orders : user.orderlist,
        user: user
        
    })
})


app.get("/login", async (req,res)=>{
    res.render('UserPanel/login')
})

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

app.post('/login', async (req,res) =>{
    const {email,password} = req.body
    const user = await userModel.findOne({email})

 bcrypt.compare(password, user.password, function(err, result) {

        console.log(result)
         if(!result)
         return res.send('Something went wrong')
         const token = jwt.sign({ id: user._id}, 'secretkey')
         res.cookie('token', token)   
         res.redirect("/") 
});

   

    
})


app.get('/search-suggestions', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const filtered = wordList
    .filter(word => word.toLowerCase().startsWith(query))
    .slice(0, 5);
  res.json(filtered);
});


app.post("/serch/:category",(req,res)=>{
    console.log("serched")

})


// app.listen(3000,(req,res)=>{
//     console.log("running")
// })


 const PORT = process.env.PORT || 3000;
 app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
 });
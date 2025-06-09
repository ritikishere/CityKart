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
const multer = require("multer")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'Public/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

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
app.use(express.static(path.join(__dirname,'Public')));
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
  

  res.render("UserPanel/Buy", { product }); 
});
app.post("/removeitem/:id", auth, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    // Remove product from user's cart
    user.cart = user.cart.filter(prodId => prodId.toString() !== req.params.id);

    await user.save();

    res.redirect("/cart");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});


app.post("/place-order/:id", auth, async (req, res) => {
  const user = await userModel.findById(req.user.id);
  const product = await productModel.findById(req.params.id); 

  // Push order to product.orders array with userId, status, date
  product.orders.push({
    userId: user._id,
    status: "Confirmed",
    date: new Date()
  });
  await product.save();

  // Also push to user's orderlist
  user.orderlist.push(product._id);
  await user.save();

  const { name, state, district, city, pincode, payment } = req.body;

  res.render("UserPanel/receipt", {
    product,
    user,
    name,
    state,
    district,
    city,
    pincode,
    payment
  });
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

    res.redirect("/productList")

    
})
app.post('/createuser', upload.single('image'), async (req,res)=>{
    let {firstName,lastName,email,contact,password} = req.body
    const hashed = await bcrypt.hash(password,10)
    const imageFilename = req.file ? req.file.filename : 'default.png'
    let createdUser = await userModel.create({
        firstName,
        lastName,
        email,
        contact,
        image: imageFilename,
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


app.post("/addreview/:id/:reviewer", async (req, res) => {
  const product = await productModel.findById(req.params.id)
  const reviewer = await userModel.findById(req.params.reviewer);
  const stars = Number(req.body.stars);
  const comment = req.body.comment;

  // Add review object in product
  product.reviews.push({
    userId: reviewer._id,
    comment: comment,
    stars: stars,
    
  });

  // Update rating details
  product.reviewno++;
  product.starCounts += stars;
  product.rating = product.starCounts / product.reviewno;

  await product.save();

  res.redirect("/");
});




app.post("/setstatus/:productId/:userId", async (req, res) => {
  const { productId, userId } = req.params;
  const newStatus = req.body.status;

  const product = await productModel.findById(productId);
  if (!product) return res.send("Product not found");

  // Find order in product.orders array for that user
  const order = product.orders.find(o => o.userId?.toString() === userId);
  if (!order) return res.send("Order not found");

  order.status = newStatus;

  await product.save();

  res.redirect("/orders"); // or wherever you want
});





// app.listen(3000,(req,res)=>{
//     console.log("running")
// })


 const PORT = process.env.PORT || 3000;
 app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
 });
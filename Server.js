const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

mongoose.connect('mongodb://127.0.0.1:27017/mydb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB connection error:", err));

const app = express();
app.use(express.json());

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model("User", UserSchema);

// Register Route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).send('User already exists');
    }

    // Hash password and store in MongoDB
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });

    await newUser.save();
    res.status(201).send('User registered');
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) { 
        return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
});

// Middleware to verify JWT
const authenticatejwt = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Access Denied');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => { // Fixed: Corrected JWT_SECRET name
        if (err) return res.status(401).send('Invalid Token');

        req.user = user;
        next();
    });
};

// Protected Route
app.get('/protected', authenticatejwt, (req, res) => {
    res.send('This is a protected route');
});

app.listen(5002, () => console.log('Server running on port 5002'));

























// const express=require('express');
// const bcrypt = require('bcryptjs');
// const jwt=require('jsonwebtoken');
// const dotenv=require('dotenv');
// const mongoose = require('mongoose');

// mongoose.connect('mongodb://127.0.0.1:27017/mydb', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
// .then(() => console.log("MongoDB connected"))
// .catch(err => console.log("MongoDB connection error:", err));

// dotenv.config();

// const app=express();
// app.use(express.json());

// const UserSchema = new mongoose.Schema({
//     username: { type: String, required: true, unique: true },
//     password: { type: String, required: true }
// });

// const User = mongoose.model("User", UserSchema);

// //create a register route
// app.post('/register',async(req,res)=> {
//     const {username,password} = req.body;

//     const UserSchema = new mongoose.Schema({
//         username: { type: String, required: true, unique: true },
//         password: { type: String, required: true }
//     });
//     // Hash password and store in MongoDB
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ username, password: hashedPassword });

//     await newUser.save();
//     res.status(201).send('User registered');
    
// })

// app.post('/login', async (req, res) => {
//     const { username, password } = req.body;

//     const user = await User.findOne({ username });
//     if (!user || !(await bcrypt.compare(password, user.password))) { 
//         return res.status(401).send('Invalid credentials');
//     }

//     const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
//     res.json({ token });
// });


// //middleware to verify if JWT is correct or not

// const authenticatejwt = (req,res,next)=>{
//     const token = req.header('Authorization')?.split(' ')[1];
//     if (!token){
//         return res.status(401).send('Access Denied');
//     }

//     jwt.verify(token,process.env.JWT_secret,(err,user)=>{
//         if (err) return res.status(401).send('Invalid Token');

//         req.user=user;
//         next()


//     });
// };

// app.get('/protected',authenticatejwt, (req,res)=>{
//     res.send('This is a protected route');

// });

// app.listen(5002,()=>console.log('Server running on port 5002'));


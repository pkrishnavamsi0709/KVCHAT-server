const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const fetchuser = require("../middleware/fetchUser");
require("../models/userModel");
mongoose.set("strictQuery", true);
const User = mongoose.model("user");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "badfkjbakjbfkjab@hsadkfbkbkj6853546354";


router.get("/",(req,res)=>{
  res.send("hello");
})

//   /api/auth/signup
router.post(
  "/signup",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "password must contain the min 5 letters").isLength({
      min: 5
    }),
    
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password,img } = req.body;
      const user = await User.findOne({ email }); //finding the email exists or not

      if (user) {
        const status=false;
        return res.json({status, msg:"user with this email already exists" });
      }

      //crete a new user
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);

      await User.create({
        name,
        email,
        password: encryptedPassword,
        img
      })
        .then((user) => {
          const token = jwt.sign({ id: user._id }, JWT_SECRET);
          const status=true;
          return res.json({status, authtoken: token });
        })
        .catch((error) => res.json({ error: "enter a valid unique email" }));
    } catch (error) {
      res.send({ status: error });
    }
  }
);

// login user details
router.post(
  "/login",
  [
    body("email", "Enter a valid Email").isEmail(),
    body("password", "password must contain the min 5 letters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        const status=false;
        return res.json({status,msg:"user not found"});
      }
      const verify = await bcrypt.compare(password, user.password);
      if (!verify) {
        const status=false;
        return res.json({status,message: "password didnt match" });
      }
      const token = jwt.sign({ id: user._id }, JWT_SECRET);
      const status=true;
      res.json({
        status:status,
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        img: user.img,
        token:token,
      });
    } 
    catch (error) {
      res.send({ error: error }, { status: "internal error" });
    }
  }
);


router.get("/allUsers",fetchuser,async(req,res)=>{
      const Id = await req.user.id; // this will be get from the fetchuser 
      const keyword = req.query.search?{
         $or:[
          {name:{$regex: req.query.search,$options:"i"}},
          {email:{$regex:req.query.search,$options:"i"}}
         ]
      }:{};

      const users= await User.find(keyword).find({_id:{$ne:Id}});
      res.send(users);
})


module.exports =router;



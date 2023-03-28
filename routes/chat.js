const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const fetchuser = require("../middleware/fetchUser");
require("../models/userModel");
mongoose.set("strictQuery", true);
const User = mongoose.model("user");
require("../models/chatModel");
mongoose.set("strictQuery", true);
const Chat = mongoose.model("chat");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "badfkjbakjbfkjab@hsadkfbkbkj6853546354";

//accesschat
router.post("/", fetchuser, async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("userId param not sent with request");
        return res.status(400);
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user.id } } },
            { users: { $elemMatch: { $eq: userId } } }
        ]
    }).populate("users", "-password").populate("latestMessage");



    isChat = await User.populate(isChat, {
        path: 'latestMessage.sender',
        select: "name email img",
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    }
    else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user.id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            console.log(createdChat);

            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");

            res.send(FullChat);
        } catch (error) {

            res.json(error);
        }
    }

})

//fetchchat
router.get("/", fetchuser, async (req, res) => {

    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name img email"
                });
                res.status(200).send(results);
            })
    } catch (error) {
           res.status(400);
           throw new Error(error.message);
    }

});

//createGropuChat
router.post("/group", fetchuser, async(req, res) => {
   if(!req.body.users || !req.body.name){
    return res.status(400).send({message:"enter the valid details"});
   }

   var users = (req.body.users);
   console.log(users);

   if(users.length<2){
    return res.status(400).send({message:"Group should contain atleast 2 members"});
   }

   users.push(req.user.id);

   try {
    const groupChat = await Chat.create({
        chatName:req.body.name,
        users:users,
        isGroupChat:true,
        groupAdmin:req.user.id,
    });

    const fullGroupChat =await Chat.findOne({_id:groupChat._id}).populate("users","-password").populate("groupAdmin","-password");
    res.status(200).json(fullGroupChat);
   } catch (error) {
     
    res.status(400);
           throw new Error(error.message);
   }
})

//renameGroup
router.put("/rename", fetchuser, async(req, res) => {
   const{chatId,chatName}=req.body;
   const chatUpdate=await Chat.findByIdAndUpdate(chatId,{
    chatName,
   },{
    new:true,
   })
   .populate("users","-password")
   .populate("groupAdmin","-password");

   if(!chatUpdate){
    res.status(400);
    throw new Error("chat not found");
   }
   else{
    res.json(chatUpdate);
   }
});


//addToGroup
router.put("/groupadd", fetchuser, async(req, res) => {
  const {chatId,userId}=req.body;
  const addedUser = await Chat.findByIdAndUpdate(chatId,
    {
    $push:{users:userId}
  },
  {
    new:true
  }).populate("users","-password")
  .populate("groupAdmin","-password");

  if(!addedUser){
    res.status(400);
    throw new Error("chat not found");
   }
   else{
    res.json(addedUser);
   }

})

//removeFromGroup
router.put("/groupremove", fetchuser, async(req, res) => {

  const {chatId,userId}=req.body;
  const removeUser = await Chat.findByIdAndUpdate(chatId,
    {
    $pull:{users:userId}
  },
  {
    new:true
  }).populate("users","-password")
  .populate("groupAdmin","-password");

  if(!removeUser){
    res.status(400);
    throw new Error("chat not found");
   }
   else{
    res.json(removeUser);
   }

})




module.exports = router;





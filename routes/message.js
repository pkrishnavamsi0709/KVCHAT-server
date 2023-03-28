const express = require("express")
const router = express.Router();
const mongoose = require("mongoose");
const fetchuser = require("../middleware/fetchUser");
require("../models/messageModel");
mongoose.set("strictQuery", true);
require("../models/userModel");
mongoose.set("strictQuery", true);
require("../models/chatModel");
mongoose.set("strictQuery", true);
const Chat = mongoose.model("chat");
const User = mongoose.model("user");
const Message = mongoose.model("Messages");

// this is to send message 
router.post("/",fetchuser,async(req,res)=>{

    const {content,chatId}=req.body;

    if(!content || !chatId){
        console.log("invalid data passed");
        return res.status(400).send("error send a valid details");
    }
    
    try {
        var message = await Message.create({
            sender:req.user.id,
            content:content,
            chat:chatId
        });

        message =await message.populate("sender","name img");
        message =await message.populate("chat");
        message =await User.populate(message,{
            path:"chat.users",
            select:"name img email"
        })

        await Chat.findByIdAndUpdate(req.body.chatId,{
            latestMessage:message,
        })

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    } 


})

router.get("/:chatId",fetchuser,async(req,res)=>{
    
    try {
        const messages = await Message.find({chat:req.params.chatId}).populate("sender","name img email").populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})
router.get("/:chatId")











module.exports =router;
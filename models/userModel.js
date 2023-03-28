const mongoose=require("mongoose");

const UserSchema = mongoose.Schema({
    name:{
        type:"String",
        required:true
    },
    email:{
        type:"String",
        required:true,
        unique:true
    },
    password:{
        type:"String",
        required:true
    },
    img:{
        type:"String",
        required:true,
        default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },

},{
    timestamps:true
},)

let UserModel =mongoose.model("user",UserSchema);
const User = mongoose.model("user") || UserModel
module.exports=User

;
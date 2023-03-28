const express=require("express");
const dotenv=require("dotenv");
const cors =require("cors");
const PORT=process.env.PORT||5000;
const app=express();
const connectToMongo=require("./db")
app.use(express.json());
app.use(cors());

dotenv.config();

connectToMongo();



app.get("/",(req,res)=>{
    res.send("This app is runnning");
})

app.use("/api/user",require("./routes/auth"))
app.use("/api/chat",require("./routes/chat"))
app.use("/api/message",require("./routes/message"))

const server = app.listen(PORT,()=>{
    console.log(`server is runnning at the port ${PORT}`)
})

const io =require('socket.io')( server,{
    pingTimeout:60000,
    cors:{
        origin:"https://kvchat7.onrender.com"
    },
});

io.on("connection",(socket)=>{
  console.log("connected to socket.io");

  socket.on("setup",(userData)=>{
    socket.join(userData._id);
    socket.emit("connected");
  })

  socket.on("join chat",(room)=>{
    socket.join(room);
    console.log("User joined Room "+room);
  });

  socket.on("typing",(room)=>{
    socket.in(room).emit("typing")
  })


  socket.on("stop typing",(room)=>{
    socket.in(room).emit("stop typing")
  })




  socket.on("new message",(newMessageReceived)=>{

    var chat = newMessageReceived.chat;
        
    if(!chat.users) return console.log("chat users not defined");

    chat.users.forEach(user=> {
        if(user._id == newMessageReceived.sender._id) return;

        socket.in(user._id).emit("message received",newMessageReceived);
    })
  });

  socket.off("setup",()=>{
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  })
})
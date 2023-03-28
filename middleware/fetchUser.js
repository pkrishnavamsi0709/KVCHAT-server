const jwt = require("jsonwebtoken");
const JWT_SECRET ="badfkjbakjbfkjab@hsadkfbkbkj6853546354";


const fetchuser= async (req,res,next)=>{
   const token =req.header("auth-token");
   if(!token){
    res.status(401).send({error:"please authenticate with avalid token"});
   }
   
   try {
    const data =await jwt.verify(token,JWT_SECRET);
   req.user=data;
   next();
   } catch (error) {
    res.send({error:""})
   }
   

}

module.exports = fetchuser;
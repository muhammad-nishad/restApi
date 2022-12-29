const jwt=require('jsonwebtoken');
const verifyToken=(req,res,next)=>{
    const token =req.body.token || req.headers.token
    if(!token){
        return res.status(400).json("A token is required for Authentication")
    }
    try {
        const decoded=jwt.verify(token,process.env.TOKEN_SECRET)
        req.user=decoded
        next()
        
    } catch (error) {
        return res.status(400).json("invalid token") 
        
    }

}
module.exports=verifyToken
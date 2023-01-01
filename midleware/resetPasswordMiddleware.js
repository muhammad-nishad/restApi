const jwt=require('jsonwebtoken')
const resetPasswordToken=(req,res,next)=>{
    const token=req.body.token||req.headers.token
    console.log(token,'token');
    if(!token){
        return res.status(400).json("A token is required for Authentication")
    }
    try {
        console.log(token);
        console.log('try');
        const decode=jwt.verify(token,process.env.RESET_PASSWORD_TOKEN_SECRET)
        console.log(decode,'decode');
        req.user=decode;
        next()
        
    } catch (error) {
        console.log(error);
        return res.status(400).json("invalid token") 
        
    }
}

module.exports=resetPasswordToken;
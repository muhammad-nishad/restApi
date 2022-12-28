const user = require('../models/user')
const bcrypt = require('bcrypt');
const userModel = require('../models/user');

exports.register = async (req, res) => {
    try {
        console.log(req.body, 'body');
        const { name, email, password } = req.body
        if (!name || !email || !password) return res.status(400).json({ message: "Please provide full credentials!" })
        const userExist = await userModel.findOne({email})
        if (userExist) return res.status(400).json({ message: "user Already exist" })
        const crypted = await bcrypt.hash(password, 10);
        const newUser = await new userModel({ name, email, password:crypted })
        newUser.save()
        res.status(200).json({ message: "signup success" })
    } catch (error) {
        console.log(error);

    }
}
exports.login=async(req,res)=>{
    try {
        const {name,email,password}=req.body;
        if (!name || !email || !password) return res.status(400).json({ message: "Please provide full credentials!" })
        const user=await userModel.findOne({email});
        if(!user) return res.status(400).json({message:"There is no user is asociated with this email"})
        const validUser=await bcrypt.compare(password,user.password)
        if(!validUser) return res.status(400).json({messaage:"invalid password"})
        res.status(200).json({message:'login success'})

        
    } catch (error) {
        console.log(error);
        
    }
}
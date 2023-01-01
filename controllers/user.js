const user = require('../models/user')
const Otp=require('../models/otp')
const bcrypt = require('bcrypt');
const userModel = require('../models/user');
const { validateLength, validateEmail } = require('../helpers/validation');
const { generateToken } = require('../midleware/token');
const sgMail = require('@sendgrid/mail');
const otp = require('../models/otp');
const serviceSID=process.env.serviceSID
const accountSID=process.env.accountSID
const authToken=process.env.authToken
const client=require('twilio')(accountSID,authToken)

exports.register = async (req, res) => {
    try {
        console.log(req.body, 'body');
        const { name, email, password } = req.body
        if (!name || !email || !password) return res.status(400).json({ message: "Please provide full credentials!" })
        if (!validateLength(name, 3, 15)) return res.status(400).json({ messaage: "name must be 3 characters" })
        if (!validateLength(password, 6, 25)) return res.status(400).json({ messaage: "password must be 6 characters" })
        if (!validateEmail(email)) return res.status(400).json({ message: "invalid email address" })
        const userExist = await userModel.findOne({ email })
        if (userExist) return res.status(400).json({ message: "user Already exist" })
        const crypted = await bcrypt.hash(password, 10);
        const newUser = await new userModel({ name, email, password: crypted })
        const token = generateToken({ id: user?._id, email: user?.email, }, "7d")
        res.cookie('token', token)
        newUser.save()
        res.status(200).json({ message: "signup success" })
    } catch (error) {
        console.log(error);

    }
}
exports.login = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: "Please provide full credentials!" })
        if (!validateLength(name, 3, 15)) return res.status(400).json({ messaage: "name must be 3 characters" })
        if (!validateLength(password, 6, 25)) return res.status(400).json({ messaage: "password must be 6 characters" })
        if (!validateEmail(email)) return res.status(400).json({ message: "invalid email address" })
        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).json({ message: "There is no user is asociated with this email" })
        const validUser = await bcrypt.compare(password, user.password)
        if (!validUser) return res.status(400).json({ messaage: "invalid password" })
        const token = generateToken({ id: user._id, email: user.email.toString(), }, "7d")
        res.cookie('token', token)
        res.status(200).json({ message: 'login success' })
    } catch (error) {
        console.log(error);

    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({})
        res.status(200).json(users)
    } catch (error) {
        console.log(error);

    }
}

exports.resetPassword = async (req, res) => {
    try {
        // console.log(req.params);
        console.log(req.body);
        const { userId } = req.params
        console.log(userId, 'id');
        const { email } = req.body
        const existingUser = await userModel.findOne({ email: req.body.email })
        if (!existingUser) return res.status(400).json({ message: 'No user is asociated with this emil' })
        const newotp = `${Math.floor(1000 + Math.random() * 9000)}`
        console.log(newotp, 'otp');
        sgMail.setApiKey(process.env.API_KEY)


        const message = {
            to: 'nishadmuhammed212@gmail.com',
            from: 'rncreations7@gmail.com',
            subject: 'Verify otp ',
            text: 'helo from',
            html: `<p>Enter This Otp  <b>${newotp} to verify your email address and compleate the process
            <p>This code will be expires in 1 hour</b></p>`
        }
        sgMail.send(message)
        .then((response)=>{
            const otp=new Otp({
                otp:newotp,
                expireIn:new Date().getTime()+300*1000
            }).save()
            // otp.save()
        })
        res.status(200).json({message:'otp sended to your email plese check and verify it'})
    



    } catch (error) {
        console.log(error);

    }
}
exports.logout = async (req, res) => {
    try {
        res.clearCookie('token', { path: '/login' })
        res.status(200).json({ message: 'logout success' })

    } catch (error) {
        console.log(error)

    }

}
exports.verifyOtp = async (req, res) => {
    try {
        // console.log(req.body,'body');
        const {otp,oldPassword,newPassword}=req.body
        console.log(otp,'otp');
        const { userId } = req.params
        const user = await userModel.findById(userId)
        // let currentTime=new Date().getTime()
        // let diff=Otp.expireIn-currentTime
        // if(diff<0)return  res.status(400).json({message:"otp expired"})
        const validOtp=await Otp.findOne({otp:req.body.otp})
        console.log(validOtp,'otppp');
        if(!validOtp) return res.status(400).json({messaage:'invalid Otp'})
        if (!oldPassword || !newPassword) return res.status(400).json({ message: "Please provide full credentials! " })
        if (!validateLength(newPassword, 6, 25)) return res.status(400).json({ messaage: "password must be 6 characters" })
        if (oldPassword == newPassword) return res.status(400).json({ message: " New password is same as the old password " })
        if (!user) return res.status(400).json({ message: 'invalid user' })
        const valid = await bcrypt.compare(oldPassword, user.password)
        if (!valid) return res.status(400).json({ message: "Old password is not valid" })
        const crypted = await bcrypt.hash(newPassword, 10);
        const updatePassword = await userModel.findByIdAndUpdate(userId, {
            $set: {
                password: crypted
            }
        })
        res.status(200).json({ message: "password updated successfully" })

        console.log('hi');

    } catch (error) {
        console.log(error);

    }
}
exports.requestOtp=(req,res)=>{
    const {number}=req.body
    client.verify
    .services(process.env.serviceSID)
    .verifications.create({
        to:`+91${number}`,
        channel:"sms"
    })
    .then((response)=>{
        console.log(response.status);  
    })
   

}
exports.otpVerification=(req,res)=>{
    const {otp,number}=req.body
    client.verify
    .services(process.env.serviceSID)
    .verificationChecks.create({
        to:`+91${number}`,
        code:otp
    })
    .then((respone)=>{
        console.log(respone.status);

    }).catch((error)=>{
        console.log(error,'wrong one');
    })
}

// sgMail.send(message)
// .then(response=>console.log('email send'))
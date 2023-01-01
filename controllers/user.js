const user = require('../models/user')
const Otp = require('../models/otp')
const bcrypt = require('bcrypt');
const userModel = require('../models/user');
const { validateLength, validateEmail } = require('../helpers/validation');
const { generateToken, generateResetToken } = require('../midleware/token');
const sgMail = require('@sendgrid/mail');
const otp = require('../models/otp');
const { response } = require('express');
const serviceSID = process.env.serviceSID
const accountSID = process.env.accountSID
const authToken = process.env.authToken
const client = require('twilio')(accountSID, authToken)

// usersignup
exports.register = async (req, res) => {
    try {
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
        res.status(500).json(error)

    }
}

// login
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
        const token = generateToken({ id: user._id, email: user.email.toString(), }, "30m")
        res.cookie('token', token)
        res.status(200).json({ message: 'login success' })
    } catch (error) {
        res.status(500).json(error)

    }
}

// getAllUsers
exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({})
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json(error)

    }
}


//sending otp to the email using sendgrid
exports.resetPasswordOtp = async (req, res) => {
    try {
        const { userId } = req.params
        const { email } = req.body
        const existingUser = await userModel.findOne({ email: req.body.email })
        if (!existingUser) return res.status(400).json({ message: 'No user is asociated with this emil' })
        const accountSid = process.env.accountSID;
        const authToken = process.env.authToken;
        const client = require('twilio')(accountSid, authToken);
        client.verify.v2.services(process.env.email_serviceSID)
            .verifications
            .create({ to: email, channel: 'email' })
            .then(verification => console.log(verification))
            .catch((error) => {
                res.status(500).json(error)
            })
        res.status(200).json({ message: 'otp sended to your email plese check and verify it' })
        const resetPasswordToken = generateResetToken({ email: email.toString(), }, "30m")
    } catch (error) {
        res.status(500).json(error)

    }
}


//verify otp
exports.verifyEmail = (req, res) => {
    try {
        const { code, email } = req.body
        const accountSid = process.env.accountSID;
        const authToken = process.env.authToken;
        const client = require('twilio')(accountSid, authToken);
        client.verify.v2.services(process.env.email_serviceSID)
            .verificationChecks
            .create({ to: email, code: code })
            .then((verificationChecks) => {
                res.status(200).json({ message: 'otp verified' })
            })
            .catch((error) => {
                res.status(400).json({ message: 'invalid otp' })
            })

    } catch (error) {
        res.status(500).json(error)
    }
}





// resetPassword
exports.resetPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body
        const { userId } = req.params
        const user = await userModel.findById(userId)
        if (!user) return res.status(400).json({ message: 'invalid user' })
        if (!oldPassword || !newPassword) return res.status(400).json({ message: "Please provide full credentials! " })
        if (!validateLength(newPassword, 6, 25)) return res.status(400).json({ messaage: "password must be 6 characters" })
        if (oldPassword == newPassword) return res.status(400).json({ message: " New password is same as the old password " })
        const valid = await bcrypt.compare(oldPassword, user.password)
        if (!valid) return res.status(400).json({ message: "Old password is not valid" })
        const crypted = await bcrypt.hash(newPassword, 10);
        const updatePassword = await userModel.findByIdAndUpdate(userId, {
            $set: {
                password: crypted
            }
        })
        res.status(200).json({ message: "password updated successfully" })
    } catch (error) {
        res.status(500).json(error)

    }
}

// logOut
exports.logout = async (req, res) => {
    try {
        res.clearCookie('token', { path: '/login' })
        res.status(200).json({ message: 'logout success' })

    } catch (error) {
        res.status(500).json(error)

    }

}

// this is routing is for sending otp to the number
exports.requestOtp = (req, res) => {
    const { number } = req.body
    client.verify
        .services(process.env.serviceSID)
        .verifications.create({
            to: `+91${number}`,
            channel: "sms"
        })
        .then((response) => {
            res.status(200).json({ message: "otp sended" })
        })


}

// this is for verifying the otp
exports.otpVerification = (req, res) => {
    try {
        const { otp, number } = req.body
        client.verify
            .services(process.env.serviceSID)
            .verificationChecks.create({
                to: `+91${number}`,
                code: otp
            })
            .then((respone) => {
                if(response.status==='approved')return res.status(200).json({messaage:"success"})
                res.status(500).json({message:'inva'})
            })
            .catch((error) => {
                res.status(400).json({ message: 'invalid otp' })
                res.status(500).json(error)
            })

    } catch (error) {
        res.status(500).json(error)

    }

}


// sgMail.send(message)
// .then(response=>console.log('email send'))

const express=require('express');
const { register, login, getAllUsers, resetPassword, logout, verifyOtp, otpVerification, requestOtp, sample, verifyEmail, resetPasswordOtp } = require('../controllers/user');
const verifyToken = require('../midleware/authMiddleware');
const resetPasswordToken=require('../midleware/resetPasswordMiddleware')
const router=express.Router()

// usersignup
router.post('/register',register)

// userlogin
router.post('/login',verifyToken,login)

// getAllusers
router.get('/getAllUsers',verifyToken,getAllUsers)

// generateOtp
router.put('/resetPasswordOtp/:userId',resetPasswordOtp)

// verifyOtp
router.post('/verifyOtp',resetPasswordToken,verifyEmail)

// resetPassword
router.post('/resetPassword/:userId',resetPasswordToken,resetPassword)

// logout
router.post('/logout',logout)

// this two routes are just for showing otp using 
// requestOtp using twilio
router.post('/otp',requestOtp)

// verifyOtp
router.post('/verify',otpVerification)


module.exports = router ;
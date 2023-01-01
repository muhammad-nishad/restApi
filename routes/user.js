
const express=require('express');
const { register, login, getAllUsers, resetPassword, logout, verifyOtp, otpVerification, requestOtp } = require('../controllers/user');
const verifyToken = require('../midleware/authMiddleware');
const router=express.Router()


router.post('/register',register)
router.post('/login',verifyToken,login)
router.get('/getAllUsers',verifyToken,getAllUsers)
router.put('/resetPassword/:userId',verifyToken,resetPassword)
router.post('/verifyOtp/:userId',verifyToken,verifyOtp)
router.post('/logout',logout)
router.post('/otp',requestOtp)
router.post('/verify',otpVerification)

module.exports = router ;
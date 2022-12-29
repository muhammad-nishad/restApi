
const express=require('express');
const { register, login, getAllUsers, resetPassword } = require('../controllers/user');
const verifyToken = require('../midleware/authMiddleware');
const router=express.Router()


router.post('/register',register)
router.post('/login',verifyToken,login)
router.get('/getAllUsers',verifyToken,getAllUsers)
router.put('/resetPassword/:userId',verifyToken,resetPassword)
router.post('/logout',logout)

module.exports = router ;
const mongoose=require('mongoose');

const otpSchema=mongoose.Schema({
    otp:String,
    expireIn:Number

})

module.exports = mongoose.model('otp', otpSchema)
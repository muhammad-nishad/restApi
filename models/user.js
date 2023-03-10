const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "first name is required"],
        },
        email: {
            type: String,
            required: [true, "email is required"],

        },
        password: {
            type: String,
            required: [true, "password is required"],
        },

    },
    {

        timestamps: true,
    }
);
module.exports = mongoose.model('user', userSchema)
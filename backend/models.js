const mongoose = require('mongoose')
require('dotenv').config()

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        dropDups: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})
const User = mongoose.model('User', UserSchema)

module.exports = { User, Event }
let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    facebook:{
        id: String,
        token: String,
        email: String,
        name: String
    }
});

const User = module.exports = mongoose.model('user', userSchema);
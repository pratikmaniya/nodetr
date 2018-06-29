let mongoose = require('mongoose');

let localUserSchema = mongoose.Schema({
    local:{
        name: String,
        email: String,
        username: String,
        password: String
    }
});

const localuser = module.exports = mongoose.model('localuser', localUserSchema);
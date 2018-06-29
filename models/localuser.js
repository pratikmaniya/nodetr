let mongoose = require('mongoose');

let localUserSchema = mongoose.Schema({
    name: String,
    email: String,
    username: String,
    password: String
});

const localuser = module.exports = mongoose.model('localuser', localUserSchema);
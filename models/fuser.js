let mongoose = require('mongoose');

let fuserSchema = mongoose.Schema({
    facebook:{
        id: String,
        token: String,
        email: String,
        name: String
    }
});

const User = module.exports = mongoose.model('fuser', fuserSchema);
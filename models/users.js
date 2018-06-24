let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
        name:{
            type: String,
            required: true
        },
        email:{
            type: String,
            required: true
        },
        username:{
            type: String,
            required: true
        },
        password:{
            type: String,
            required: true
        },
    google:{
        id: String,
        token: String,
        email: String,
        name: String
    }
});

const user = module.exports = mongoose.model('user', userSchema);
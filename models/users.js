let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    local:{
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
        }
    },
    facebook:{
        id: String,
        token: String,
        email: String,
        name: String
    }
});

const User = module.exports = mongoose.model('user', userSchema);
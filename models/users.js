let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
        local:{
            name: String,
            email: String,
            username: String,
            password: String
        },
        google:{
            id: String,
            token: String,
            email: String,
            name: String
        },
        facebook:{
            id: String,
            token: String,
            email: { type: String, default: 'Email is not specified in Facebook!' },
            name: String
        },
        twitter:{
            id: String,
            token: String,
            email: { type: String, default: 'Email is not specified in Twitter!' },
            name: String
        },
        github:{
            id: String,
            token: String,
            email: { type: String, default: 'Email is not specified in Github!' },
            name: String
        }
});

const user = module.exports = mongoose.model('user', userSchema);
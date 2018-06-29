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
            email: String,
            name: String
        },
        twitter:{
            id: String,
            token: String,
            email: String,
            name: String
        },
        github:{
            id: String,
            token: String,
            email: String,
            name: String
        }
});

const user = module.exports = mongoose.model('user', userSchema);
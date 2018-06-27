let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
        local:{
            name:{
                type: String
            },
            email:{
                type: String
            },
            username:{
                type: String
            },
            password:{
                type: String
            },
        },
        google:{
            id: String,
            token: String,
            email: String,
            name: String,
            photo: String,
            gender: String
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
        }
});

const user = module.exports = mongoose.model('user', userSchema);
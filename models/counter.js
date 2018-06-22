let mongoose = require('mongoose');

let counterSchema = mongoose.Schema({
    name:{
        type: String
    },
    count:{
        type: 'number'
    }
});

let Counter = module.exports = mongoose.model('Counter', counterSchema);
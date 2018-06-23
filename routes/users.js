const express = require('express');
const app = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const db = require('../app');

let User = require('../models/users');

app.get('/register', function(req, res) {
    res.render('register', {
        counter: db.counter
    });
});

app.post('/register', function(req, res, next) {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Password do not match').equals(password);

    let errors = req.validationErrors();

    if(errors){
        res.render('register', {
            errors:errors
        });
    }
    else{
        let newUser = new User({
            name:name,
            email:email,
            username:username,
            password:password
        });

        User.find({email:newUser.email}, function(err, email) {
            if(email.length){
                req.flash('danger', 'Email is already registered!');
                res.redirect('/users/register');
            }
            else{
                User.find({username:newUser.username}, function(err, user) {
                    if(user.length){
                        req.flash('danger', 'Sorry, username is already taken try different one please!');
                        res.redirect('/users/register');
                    }
                    else{
                        bcrypt.genSalt(10, function(err, salt) {
                            bcrypt.hash(newUser.password, salt, function(err, hash) {
                                if(err){
                                    console.log(err);
                                }
                                newUser.password = hash;
                                newUser.save(function(err) {
                                    if(err) {
                                        console.log(err);
                                        return;
                                    }
                                    else {
                                        req.flash('success', 'You are now registered and can login!');
                                        res.redirect('/users/login');
                                    }
                                });            
                            });
                        });
                    }
                });
            }
        });
    }
});

app.get('/login', function(req, res) {
    res.render('login', {
        counter: db.counter
    });
});

app.post('/login', function(req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

app.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = app;
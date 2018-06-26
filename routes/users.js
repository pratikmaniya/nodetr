const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const passport = require('passport');

let User = require('../models/users');

app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});

app.get('/register', function(req, res) {
    res.render('register.pug');
});

app.post('/register', function(req, res, next) {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    req.checkBody('name', 'Name is required.').notEmpty();
    req.checkBody('email', 'Email is required.').notEmpty();
    req.checkBody('email', 'Email is not valid.').isEmail();
    req.checkBody('username', 'Username is required.').notEmpty();
    req.checkBody('password', 'Password is required.').notEmpty();
    req.checkBody('password2', 'Confirm Password does not match with Password.').equals(password);

    let errors = req.validationErrors();

    if(errors){
        res.render('register.pug', {
            errors:errors
        });
    }
    else{
        let newUser = new User();
            newUser.local.name = name;
            newUser.local.email = email;
            newUser.local.username = username;
            newUser.local.password = password;
        User.find({email : newUser.local.email}, function(err, email) {
            if(email.length){
                req.flash('danger', 'Email is already registered!');
                res.redirect('/users/register');
            }
            else{
                User.find({username:newUser.local.username}, function(err, user) {
                    if(user.length){
                        req.flash('danger', 'Sorry, username is already taken try different one please!');
                        res.redirect('/users/register');
                    }
                    else{
                        bcrypt.genSalt(10, function(err, salt) {
                            bcrypt.hash(newUser.local.password, salt, function(err, hash) {
                                if(err){
                                    console.log(err);
                                }
                                newUser.local.password = hash;
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
    res.render('login.pug',);
});

app.post('/login', function(req, res, next) {
    passport.authenticate('local-strategy', {
        successRedirect: '/users/profile',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

app.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});

app.get('/profile', isLoggedIn, function(req, res){
    res.render('../views/profile.pug', {user: req.user});
});

app.get('/auth/google',passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { 
    successRedirect: '/users/profile',
    failureRedirect: '/register' 
}));

app.get('/auth/facebook',passport.authenticate('facebook', { scope: ['email'] }));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { 
    successRedirect: '/users/profile',
    failureRedirect: '/register' 
}));

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/users/login');
}

module.exports = app;
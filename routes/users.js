const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/users');
const LUser = require('../models/localuser');

app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});

app.get('/register', isNotLoggedIn, function(req, res) {
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

app.get('/login', isNotLoggedIn, function(req, res) {
    res.render('login.pug',);
});

app.post('/login', function(req, res, next) {
    passport.authenticate('local-signin', {
        successRedirect: '/users/profile',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

app.get('/connectlogin', isNotLoggedIn, function(req, res) {
    res.render('connectLogin.pug',);
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

app.get('/auth/twitter',passport.authenticate('twitter'));

app.get('/auth/twitter/callback', passport.authenticate('twitter', { 
    successRedirect: '/users/profile',
    failureRedirect: '/register' 
}));

app.get('/auth/github',passport.authenticate('github'));

app.get('/auth/github/callback', passport.authenticate('github', { 
    successRedirect: '/users/profile',
    failureRedirect: '/register' 
}));

app.get('/connect/facebook', isLoggedIn, passport.authorize('facebook', { scope: 'email' }));
app.get('/connect/google', isLoggedIn, passport.authorize('google', { scope: ['profile', 'email'] }));
app.get('/connect/twitter', isLoggedIn, passport.authorize('twitter'));
app.get('/connect/github', isLoggedIn, passport.authorize('github'));

app.get('/unlink/facebook', isLoggedIn, function(req,res) {
    var user = req.user;
    user.facebook.token = null;

    user.save(function(err){
        if (err)
            throw err;
        res.redirect('/users/profile');
    });
});
app.get('/unlink/google', isLoggedIn, function(req,res) {
    var user = req.user;
    user.google.token = null;

    user.save(function(err){
        if (err)
            throw err;
        res.redirect('/users/profile');
    });
});
app.get('/unlink/twitter', isLoggedIn, function(req,res) {
    var user = req.user;
    user.twitter.token = null;

    user.save(function(err){
        if (err)
            throw err;
        res.redirect('/users/profile');
    });
});
app.get('/unlink/github', isLoggedIn, function(req,res) {
    var user = req.user;
    user.github.token = null;

    user.save(function(err){
        if (err)
            throw err;
        res.redirect('/users/profile');
    });
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/users/login');
}

function isNotLoggedIn(req, res, next) {
    if(!req.isAuthenticated()){
        return next();
    }
    req.flash('danger', 'You are already logged in');
    res.redirect('/users/profile');
}

module.exports = app;
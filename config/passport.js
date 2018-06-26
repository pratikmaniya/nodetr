const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/users');
const config = require('../config/database');
const bcrypt = require('bcryptjs');
var configAuth = require('./auth');

module.exports = function(passport) {
    passport.use('local-strategy', new LocalStrategy(function(username, password, done){
        let query = {'local.username':username};
        User.findOne(query, function(err, user) {
            if(err) throw err;
            if(!user) {
                return done(null, false, {message: 'No user found'});
            }

            bcrypt.compare(password, user.local.password, function(err, isMatch) {
                if(err) throw err;
                if(isMatch) {
                    return done(null, user);
                }
                else {
                    return done(null, false, {message: 'Wrong password'});
                }
            });
        });
	}));
	
	passport.use(new FacebookStrategy({
		clientID: configAuth.facebookAuth.clientId,
		clientSecret: configAuth.facebookAuth.clientSecret,
		callbackURL: configAuth.facebookAuth.callbackURL,
		profileFields: ['id', 'displayName', 'name', 'email']
	  },
	  function(accessToken, refreshToken, profile, done) {
		console.log(profile);
		process.nextTick(function(){
			User.findOne({'facebook.id' : profile.id}, function(err, user) {
				if(err)
					return done(err);
				if(user)
					return done(null, user);
				else{
					var newUser = new User();
					newUser.facebook.id = profile.id,
					newUser.facebook.token = accessToken,
					newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName,
					newUser.facebook.email = profile.emails[0].value;

					newUser.save(function(err){
						if(err)
							throw err;
						return done(null, newUser);
					});
				}
			});
		});
	  }
	));

    passport.use(new GoogleStrategy({
		clientID: configAuth.googleAuth.clientId,
		clientSecret: configAuth.googleAuth.clientSecret,
		callbackURL: configAuth.googleAuth.callbackURL
	  },
	  function(accessToken, refreshToken, profile, done) {
		console.log(profile);
		process.nextTick(function(){
			User.findOne({'google.id' : profile.id}, function(err, user) {
				if(err)
					return done(err);
				if(user)
					return done(null, user);
				else{
					var newUser = new User();
					newUser.google.id = profile.id,
					newUser.google.token = accessToken,
					newUser.google.name = profile.displayName,
					newUser.google.email = profile.emails[0].value,
					newUser.google.gender = profile.gender,
					newUser.google.photos = profile.photos[0].value;
					console.log(newUser.google.birthday);
					newUser.save(function(err){
						if(err)
							throw err;
						return done(null, newUser);
					});
				}
			});
		});
	  }
	));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
}


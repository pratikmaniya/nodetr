const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GithubStrategy = require('passport-github').Strategy;
const User = require('../models/users');
const LUser = require('../models/localuser');
const config = require('../config/database');
const bcrypt = require('bcryptjs');
var configAuth = require('./auth');

module.exports = function(passport) {
	passport.use('local-signin', new LocalStrategy({
		passReqToCallback:true
	}, function(req, username, password, done){
		if(!req.user){
			let query = {'local.username':username};
			LUser.findOne(query, function(err, luser) {
				if(err) throw err;
				if(!luser) {
					return done(null, false, {message: 'No user found'});
				}
				bcrypt.compare(password, luser.local.password, function(err, isMatch) {
					if(err) throw err;
					if(isMatch) {
						let query = {'local.username': username};
						User.findOne(query, function(err, user) {
							if(err) throw err;
							if(user) {
								return done(null, user);
							}
							else{
								var user = new User();
								user.local.name = luser.local.name;
								user.local.email = luser.local.email;
								user.local.username = luser.local.username;
								user.local.password = luser.local.password;

								user.save(function(err){
									if(err)
										throw err;
									return done(null, user);
								});
							}
						});
					}
					else {
						return done(null, false, {message: 'Wrong password'});
					}
				});
			});
		}
		else{
			let query = {'local.username':username};
			User.findOne(query, function(err, luser) {
				if(err) throw err;
				if(!luser) {
					return done(null, false, {message: 'No user found'});
				}
				bcrypt.compare(password, luser.local.password, function(err, isMatch) {
					if(err) throw err;
					if(!isMatch) {
						return done(null, false, {message: 'Wrong password'});
					}
					else {
						var user = req.user;
						user.local.name = luser.local.name;
						user.local.email = luser.local.email;
						user.local.username = luser.local.username;
						user.local.password = luser.local.password;

						user.save(function(err){
							if(err)
								throw err;
							return done(null, user);
						});
						luser.remove();
					}
				});			
			});
		}
	}));
	
	passport.use(new FacebookStrategy({
		clientID: configAuth.facebookAuth.clientId,
		clientSecret: configAuth.facebookAuth.clientSecret,
		callbackURL: configAuth.facebookAuth.callbackURL,
		profileFields: ['id', 'displayName', 'name', 'email'],
		passReqToCallback: true
	  },
	  function(req, accessToken, refreshToken, profile, done) {
		console.log(profile);
		process.nextTick(function(){
			if(!req.user){
				User.findOne({'facebook.id' : profile.id}, function(err, user) {
					if(err)
						return done(err);
					if(user){
						if(!user.facebook.token){
							user.facebook.token = accessToken;
							user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName,
							user.facebook.email = profile.emails[0].value;
							user.save(function(err){
								if(err)
									throw err;
							});
						}
						return done(null, user);
					}
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
			}
			else {
				var user = req.user;
				user.facebook.id = profile.id,
				user.facebook.token = accessToken,
				user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName,
				user.facebook.email = profile.emails[0].value;

				user.save(function(err){
					if(err)
						throw err;
					return done(null, user);
				});
			}
		});
	  }
	));

    passport.use(new GoogleStrategy({
		clientID: configAuth.googleAuth.clientId,
		clientSecret: configAuth.googleAuth.clientSecret,
		callbackURL: configAuth.googleAuth.callbackURL,
		passReqToCallback: true
	  },
	  function(req, accessToken, refreshToken, profile, done) {
		console.log(profile);
		process.nextTick(function(){
			if(!req.user)	{
				User.findOne({'google.id' : profile.id}, function(err, user) {
					if(err)
						return done(err);
					if(user){
						if(!user.google.token) {
							user.google.token = accessToken;
							user.google.name = profile.displayName,
							user.google.email = profile.emails[0].value,
							user.save(function(err){
								if(err)
									throw err;
							});
						}
						return done(null, user);
					}
					else{
						var newUser = new User();
						newUser.google.id = profile.id,
						newUser.google.token = accessToken,
						newUser.google.name = profile.displayName,
						newUser.google.email = profile.emails[0].value,
						newUser.save(function(err){
							if(err)
								throw err;
							return done(null, newUser);
						});
					}
				});
			}
			else {
				var user = req.user;
				user.google.id = profile.id,
				user.google.token = accessToken,
				user.google.name = profile.displayName,
				user.google.email = profile.emails[0].value,
				
				user.save(function(err){
					if(err)
						throw err;
					return done(null, user);
				});
			}
			
		});
	  }
	));

	passport.use(new TwitterStrategy({
		consumerKey: configAuth.twitterAuth.clientId,
		consumerSecret: configAuth.twitterAuth.clientSecret,
		callbackURL: configAuth.twitterAuth.callbackURL,
		passReqToCallback: true,
		includeEmail: true
	  },
	  function(req, token, tokenSecret, profile, done) {
		process.nextTick(function(){
			if(!req.user) {
				User.findOne({'twitter.id' : profile.id}, function(err, user) {
					if(err)
						return done(err);
					if(user){
						if(!user.twitter.token){
							user.twitter.token = token;
							user.twitter.name = profile.displayName,
							user.twitter.email = profile.emails[0].value;
							user.save(function(err){
								if(err)
									throw err;
							});
						}
						return done(null, user);
					}
					else{
						var newUser = new User();
						newUser.twitter.id = profile.id,
						newUser.twitter.token = token,
						newUser.twitter.name = profile.displayName,
						newUser.twitter.email = profile.emails[0].value;
						newUser.save(function(err){
							if(err)
								throw err;
							return done(null, newUser);
						});
					}
				});
			}
			else {
				var user = req.user;
				user.twitter.id = profile.id,
				user.twitter.token = token,
				user.twitter.name = profile.displayName,
				user.twitter.email = profile.emails[0].value;
				user.save(function(err){
					if(err)
						throw err;
					return done(null, user);
				});
			}
		});
	  }
	));

	passport.use(new GithubStrategy({
		clientID: configAuth.githubAuth.clientId,
		clientSecret: configAuth.githubAuth.clientSecret,
		callbackURL: configAuth.githubAuth.callbackURL,
		passReqToCallback: true
	  },
	  function(req, accessToken, refreshToken, profile, done) {
		process.nextTick(function(){
			if(!req.user) {
				User.findOne({'github.id' : profile.id}, function(err, user) {
					if(err)
						return done(err);
					if(user){
						if(!user.github.token){
							user.github.token = accessToken;
							user.github.name = profile.displayName,
							user.github.email = profile.emails[0].value;
							user.save(function(err){
								if(err)
									throw err;
							});
						}
						return done(null, user);
					}
					else{
						var newUser = new User();
						newUser.github.id = profile.id,
						newUser.github.token = accessToken,
						newUser.github.name = profile.displayName,
						newUser.github.email = profile.emails[0].value;
	
						newUser.save(function(err){
							if(err)
								throw err;
							return done(null, newUser);
						});
					}
				});
			}
			else{
				var user = req.user;
				user.github.id = profile.id,
				user.github.token = accessToken,
				user.github.name = profile.displayName,
				user.github.email = profile.emails[0].value;

				user.save(function(err){
					if(err)
						throw err;
					return done(null, user);
				});
			}
			
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


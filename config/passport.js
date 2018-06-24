const LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
const user = require('../models/users');
const User = require('../models/fuser');
const config = require('../config/database');
const bcrypt = require('bcryptjs');
var configAuth = require('./auth');

module.exports = function(passport) {
    passport.use(new LocalStrategy(function(username, password, done){
        let query = {username:username};
        user.findOne(query, function(err, user) {
            if(err) throw err;
            if(!user) {
                return done(null, false, {message: 'No user found'});
            }

            bcrypt.compare(password, user.password, function(err, isMatch) {
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
		process.nextTick(function(){
			User.findOne({'facebook.id' : profile.id}, function(err, user) {
                console.log(profile);
                if(err)
					return done(err);
				if(user)
					return done(null, user);
				else{
					let newUser = new User();
					newUser.facebook.id = profile.id,
					newUser.facebook.token = accessToken,
                    newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName,
                    newUser.facebook.email = profile.emails[0].value

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

    
}


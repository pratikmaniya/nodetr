const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

mongoose.connect(config.database);
let db = mongoose.connection;

db.once('open', function() {
    console.log('Connected to MongoDB');
});

db.on('error', function(err) {
    console.log(err);
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg : msg,
            value :value
        };
    }
}));

app.get('/main.js', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'main.js'));
});

app.get('/style.css', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'css', 'style.css'));
});

let Article = require('./models/article');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

let Counter = require('./models/counter');
let counter=0;      

app.get('/', function(req, res) {
    Article.find({}, function(err, articles) {
        if(err){
            console.log(err);
        }
        else{
            Counter.findByIdAndUpdate("5b2cbec2ce608224181baf86",{ $inc: { count: 1 } },function(err){
                if(err){
                    console.log(err);
                }
            });
            Counter.findById("5b2cbec2ce608224181baf86",function(err, counte) {
                global.counter=counte.count;
            });
            res.render('index.pug', {
                title: 'Articles',
                counter: global.counter,
                articles: articles
            });
        }
    });
});

app.get('/check-login', function (req, res) {
    if (req.session && req.session.auth && req.session.auth.userId) {
        pool.query('SELECT * FROM "user" WHERE id = $1', [req.session.auth.userId], function (err, result) {
            if (err) {
               res.status(500).send(err.toString());
            } else {
               res.send(result.rows[0].username);    
            }
        });
    } else {
        res.status(400).send('You are not logged in');
    }
 });

app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/users/login');
}

app.set('view engine', 'ejs');
app.get('/profile', isLoggedIn, function(req, res){
    res.render('../views/profile.ejs', {user: req.user});
    console.log(req.user);
});

app.get('/auth/google',passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { 
    successRedirect: '/profile',
    failureRedirect: '/register' 
}));

let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);
module.exports = app ;

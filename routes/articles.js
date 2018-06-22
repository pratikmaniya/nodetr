const express = require('express');
const app = express.Router();
const db = require('../app');

let Article = require('../models/article');
let User = require('../models/users');

app.get('/add', ensureAuthenticated, function(req, res) {
    res.render('addArticle', {
        title: 'Add Articles',
        counter: db.counter
    });
});

app.post('/add', function(req, res) {
    req.checkBody('title', 'Title should not be empty!').notEmpty();
    //req.checkBody('author', 'Author should not be empty!').notEmpty();
    req.checkBody('body', 'Body should not be empty!').notEmpty();

    let errors = req.validationErrors();

    if(errors) {
        res.render('addArticle', {
            title:'Add Articles',
            errors:errors
        });
    }
    else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save(function(err) {
            if(err){
                console.log(err);
            }
            else{
                req.flash('success', 'Article Added!');
                res.redirect('/');
            }
        });
    }
});

app.get('/:id', function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        User.findById(article.author, function(err, user) {
            res.render('article', {
                article:article,
                author:user.name,
                counter: db.counter
            });
        });
    });
});

app.get('/edit/:id', ensureAuthenticated, function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        if(article.author != req.user._id) {
            req.flash('danger', 'Not Authorised');
            res.redirect('/');
        }
        else{
            res.render('editArticle', {
                title : 'Edit Article',
                article:article,
                counter: db.counter
            });
        }
    });
});

app.post('/edit/:id', function(req, res) {
    let article = {};
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    let query = {_id:req.params.id}

    Article.update(query, article, function(err) {
        if(err){
            console.log(err);
        }
        else{
            req.flash('success', article.title+' is Updated!');
            res.redirect('/');
        }
    });
});

app.delete('/:id', function(req, res) {
    if(!req.user._id) {
        res.status(500).send();
    }
    let query = {_id:req.params.id}

    Article.findById(req.params.id, function(err, article) {
        if(article.author != req.user._id) {
            res.status(500).send();
        }
        else {
            Article.remove(query, function(err) {
                if(err) {
                    console.log(err);
                }
                req.flash('success', 'Article Deleted!');
                res.send('success');
            });
        }
    });
});

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    else {
        req.flash('danger', 'Please Login First');
        res.redirect('/users/login');
    }
}

module.exports = app;
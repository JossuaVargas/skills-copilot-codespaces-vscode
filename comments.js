// Create web server

// Load modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Comment = require('../models/comment');
const { request } = require('express');

// Create router object
const commentRouter = express.Router();

// Use bodyParser to parse body of request message
commentRouter.use(bodyParser.json());

// Route '/'
commentRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => { // GET all comments
    Comment.find(req.query)
    .populate('author')
    .then(comments => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comments);
    }, err => next(err))
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => { // POST new comment
    if (req.body != null) {
        req.body.author = req.user._id;
        Comment.create(req.body)
        .then(comment => {
            Comment.findById(comment._id)
            .populate('author')
            .then(comment => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comment);
            });
        }, err => next(err))
        .catch(err => next(err));
    } else {
        err = new Error('Comment not found in request body');
        err.status = 404;
        return next(err);
    }
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => { // PUT all comments
    res.statusCode = 403;
    res.end('PUT operation not supported on /comments');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { // DELETE all comments
    Comment.deleteMany({})
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    }, err => next(err))
    .catch(err => next(err));
});

// Route '/:commentId'
commentRouter.route('/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => { // GET
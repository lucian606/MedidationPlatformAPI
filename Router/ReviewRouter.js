var express = require('express');
var router = express.Router();
var request = require('request');
const Reviews = require('../models/Review');
const Users = require('../models/Users');
const {deleteAllReviews, getAllReviews, getReview, deleteReview, updateReview, addReview} = require('../apis/ReviewsApi');
const {validateToken, createMessage} = require('../apis/CommonApi');

router.get('/deleteAllReviews', (req, res) => {
    deleteAllReviews().then(() => {
        res.send('All reviews deleted');
    });
})

router.get('/reviews', function(req, res) {
    getAllReviews().then((queryResponse) => {
        res.status(queryResponse.code);
        res.send(queryResponse.data);
    });
})

router.post('/reviews', function (req, res) {
    let token = req.headers.authorization;
    token = token ? token.slice(7) : null;
    let user = token ? validateToken(token) : null;
    if (user == null) {
        res.status(403);
        res.send(createMessage("You need to be logged in to post a review"));
    } else {
        req.body.user_id = user.id;
        addReview(req.body).then((queryResponse) => {
            res.status(queryResponse.code);
            res.send(queryResponse.data);
        });
    }
})

router.get('/reviews/:id', function(req, res) {
    getReview(req.params.id).then((queryResponse) => {
        res.status(queryResponse.code);
        res.send(queryResponse.data);
    });
})

router.delete('/reviews/:id', function(req, res) {
    deleteReview(req.params.id).then((queryResponse) => {
        res.status(queryResponse.code);
        res.send(queryResponse.data);
    });
})

router.patch('/reviews/:id', function(req, res) {
    let newMessage = req.body.message
    updateReview(req.params.id, newMessage).then((queryResponse) => {
        res.status(queryResponse.code);
        res.send(queryResponse.data);
    });
})

module.exports = router;
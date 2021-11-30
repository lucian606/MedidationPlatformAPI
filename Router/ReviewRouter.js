var express = require('express');
var router = express.Router();
var request = require('request');
const Reviews = require('../models/Review');
const Users = require('../models/Users');
const {deleteAllReviews, getAllReviews, getReview, deleteReview, updateReview, addReview} = require('../apis/ReviewsApi');

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
    addReview(req.body).then((queryResponse) => {
        res.status(queryResponse.code);
        res.send(queryResponse.data);
    });
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
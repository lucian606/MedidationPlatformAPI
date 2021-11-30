var express = require('express');
var router = express.Router();
var request = require('request');
const Reviews = require('../models/Review');
const Users = require('../models/Users');
const {getAllReviews, getReview, deleteReview, updateReview, addReview} = require('../apis/ReviewsApi');

router.get('/plm', (req, res) => {
    Reviews.deleteMany({}, () => 
    console.log("Cleared DB")
    );
    res.send('HOME')
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
    if (typeof newMessage !== 'string') {
        res.status(400);
        res.send({"Message" : "Message must be string"});
    } else {
        Reviews.find({id : req.params.id},{_id:0}).then( (entry, err) => {
            if (err) {
                console.log(err);
            }
            if (entry.length == 0) {
                res.status(404);
                res.send({"Message" : "No review with the given id"});
            } else {
                Reviews.findOneAndUpdate({id : req.params.id}, {message : newMessage}, {upsert : false, useFindAndModify: false}, (err, doc) => {
                    if (err) {
                        console.log(err);
                    } else {
                        res.status(200);
                        res.send({"Message" : "Entry updated"});
                    }
                })
            }
         })
    }
})

module.exports = router;
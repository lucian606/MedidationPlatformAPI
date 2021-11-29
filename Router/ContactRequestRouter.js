var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
require('dotenv').config();

const orders = ["asc", "desc", "ASC", "DESC"]
const sortCriterias = ["email", "name", "message", "id"]

const ContactRequests = require('../models/ContactRequest.js');
const mail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        'user': process.env.SENDER_MAIL,
        'pass': process.env.SENDER_PASS
    }
})

router.get('/deleteAll', function(req, res) {
    ContactRequests.deleteMany({}, () => 
        console.log("Cleared DB")
    );
    res.send('HOME')
})

router.get('/contact-requests', function (req, res) {
    let sortBy = req.query.sortBy;
    let order = req.query.order;
    let filterBy = req.query.filterBy;

    sortBy = sortCriterias.includes(sortBy) ? sortBy : "empty";
    order = orders.includes(order) ? order : 0;
    filterBy = (filterBy !== undefined && filterBy.trim() != '') ? JSON.parse(filterBy) : {}

    ContactRequests.find(filterBy,{_id : 0}).sort({[sortBy] : order}).exec( (err, collection) => {
        if (err) {
            console.log(err);
        }
        res.status(200);
        res.send(collection);
     })
})

router.post('/contact-requests', function (req, res) {
    let newEntryData = req.body;
    ContactRequests.create(newEntryData, (err, db) => {
        if (err) {
            res.status(400);
            res.send({"Message" : "Invalid body"});
        } else {
            let name = newEntryData.name;
            let userMessage = newEntryData.message;
            let message = {
                from: process.env.SENDER_MAIL,
                to: process.env.RECEIVER_MAIL,
                subject: 'A new request was made',
                text: 'Message: ' + userMessage + "\n" + 'From: ' + name
            }
            mail.sendMail(message, (err, info) => {});              
            res.status(200);
            res.send({"Message" : "Entry added"});
        }
    })
})

router.get('/contact-requests/:id', function(req, res) {
    ContactRequests.find({id : req.params.id},{_id:0}).then( (entry, err) => {
        if (err) {
            console.log(err);
        }
        if (entry.length == 0) {
            res.status(404);
            res.send({"Message" : "No entry with the given id"});
        } else {
            res.status(200);
            res.send(entry);
        }
     })
})

router.delete('/contact-requests/:id', function(req, res) {
    ContactRequests.findOneAndDelete({id : req.params.id}, (err, removeSuccess) => {
        if (err) {
            console.log(err);
        }
        if (!removeSuccess) {
            res.status(404);
            res.send({"Message" : "No entry with the given id"});
        } else {
            res.status(200);
            res.send({"Message" : "Entry deleted"});
        }
     })
})

router.patch('/contact-requests/:id', function(req, res) {
    let resolve = req.body.is_resolved
    if (typeof resolve !== 'boolean') {
        res.status(400);
        res.send({"Message" : "Is resolved must be present and boolean"});
    } else {
        ContactRequests.find({id : req.params.id},{_id:0}).then( (entry, err) => {
            if (err) {
                console.log(err);
            }
            if (entry.length == 0) {
                res.status(404);
                res.send({"Message" : "No entry with the given id"});
            } else {
                ContactRequests.findOneAndUpdate({id : req.params.id}, {is_resolved : resolve}, {upsert : false, useFindAndModify: false}, (err, doc) => {
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
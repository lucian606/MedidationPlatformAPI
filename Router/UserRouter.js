var express = require('express');
var router = express.Router();
const Users = require('../models/Users.js');
const jwt = require("jsonwebtoken");
const e = require('express');
const studentRegex = /[a-z0-9\._%+!$&*=^|~#%{}/\-]+@stud.upb.ro/
const teacherRegex = /[a-z0-9\._%+!$&*=^|~#%{}/\-]+@onmicrosoft.upb.ro/

function validateEmail(role, email) {
    if (role === "teacher") {
        return teacherRegex.test(email)
    } else if (role == "student") {
        return studentRegex.test(email)
    } else {
        return false;
    }
}

router.get('/deleteAllUsers', function(req, res) {
    Users.deleteMany({}, () => 
        console.log("Cleared DB")
    );
    res.send('HOME')
})

router.get('/users', function (req, res) {
    Users.find({},{_id : 0, password : 0}).then( (collection, err) => {
        if (err) {
            console.log(err);
        }
        res.status(200);
        res.send(collection);
     })
})

router.get('/users/:id', function(req, res) {
    Users.find({id : req.params.id},{_id : 0, password : 0}).then( (entry, err) => {
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

router.delete('/users/:id', function(req, res) {
    Users.findOneAndDelete({id : req.params.id}, (err, removeSuccess) => {
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

router.patch('/users/:id', function(req, res) {
    let updatedContent = req.body
    Users.find({id : req.params.id},{_id:0}).then( (entry, err) => {
        if (err) {
            console.log(err);
        }
        if (entry.length == 0) {
            res.status(404);
            res.send({"Message" : "No entry with the given id"});
        } else {
            role = updatedContent.role ? updatedContent.role : entry[0].role;
            email = updatedContent.email ? updatedContent.email : entry[0].email;
            updatedContent.id = entry[0].id; // prevent id change :)
            if (!validateEmail(role, email)) {
                res.status(400);
                res.send({"Message" : "Email doesn't match the role"})
            } if (updatedContent.password && updatedContent.password !== updatedContent.confirmation_password) {
                res.status(400);
                res.send({"Message" : "Passwords don't match"})
            }
            else {
                Users.findOneAndUpdate({id : req.params.id}, {$set : updatedContent }, {upsert : false, useFindAndModify: false, runValidators : true}, (err) => {
                    if (err) {
                        res.status(400);
                        res.send({"Message" : "Invalid body"})
                    } else {
                        res.status(200);
                        res.send({"Message" : "Entry updated"});
                    }
                })
            }}
        })
})

router.post('/auth/register', function (req, res) {
    newEntryData = req.body

    if (newEntryData.password !== newEntryData.confirmation_password) {
        res.status(400);
        res.send({"Message" : "Passwords don't match"});
    } else if (!validateEmail(newEntryData.role, newEntryData.email)) {
        res.status(400);
        res.send({"Message" : "Invalid email for the role given"});      
    } else {
        Users.create(newEntryData, (err, db) => {
            if (err) {
                res.status(400);
                res.send({"Message" : "Invalid body"});
            } else {
                res.status(200);
                res.send({"Message" : "Entry added"});
            }
        })
    }
})

router.post('/auth/login', function (req, res) {
    newEntryData = req.body

    if (typeof newEntryData.email !== 'string' || typeof newEntryData.password !== 'string') {
        res.status(400);
        res.send({"Message" : "Invalid body"});
    } else {
        Users.find({email : newEntryData.email, password : newEntryData.password}).then( (entry, err) => {
            if (err) {
                console.log(err);
            }
            if (entry.length == 0) {
                res.status(401);
                res.send({"Message" : "Invalid email and password combination"});
            } else {
                res.status(200);
                const token = jwt.sign({
                    'email': newEntryData.email}, 
                    process.env.TOKEN_SECRET,
                    {expiresIn : 1800});
                res.json({'token' : token});
            }
        })
    }
})

module.exports = router
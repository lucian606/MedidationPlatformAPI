var express = require('express');
var router = express.Router();
const { deleteAllUsers, getAllUsers, getUserWithId, deleteUser, registerUser, loginUser, updateUser } = require('../apis/UsersApi');

router.get('/deleteAllUsers', function(req, res) {
    deleteAllUsers();
    res.status(200);
    res.send("All users deleted");
})

router.get('/users', function (req, res) {
    getAllUsers().then((queryResponse) => {
        res.status(queryResponse.code);
        res.send(queryResponse.data);
    });
})

router.get('/users/:id', function(req, res) {
    getUserWithId(req.params.id).then((queryResponse) => {
        res.status(queryResponse.code);
        res.send(queryResponse.data);
    });
})

router.delete('/users/:id', function(req, res) {
    deleteUser(req.params.id).then((queryResponse) => {
        res.status(queryResponse.code);
        res.send(queryResponse.data);
    });
})

router.patch('/users/:id', function(req, res) {
    updateUser(req.params.id, req.body).then((queryResponse) => {
        res.status(queryResponse.code);
        res.send(queryResponse.data);
    });
})

router.post('/auth/register', function (req, res) {
    registerUser(req.body).then((queryResponse) => {
        res.status(queryResponse.code);
        res.send(queryResponse.data);
    });
})

router.post('/auth/login', function (req, res) {
    loginUser(req.body).then((queryResponse) => {
        res.status(queryResponse.code);
        res.send(queryResponse.data);
    });
})

module.exports = router
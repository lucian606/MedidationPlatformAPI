var express = require('express');
var router = express.Router();
const {validateToken, createMessage} = require('../apis/CommonApi.js')

const {deleteAllTutoringClasses, getAllTutoringClasses, getTutoringClassById, addTutoringClass, deleteTutoringClass, updateTutoringClass} = require('../apis/TutoringClassesApi');
const { validate } = require('../models/TutoringClass');

router.get('/deleteAllTutoringClasses', function(req, res) {
    deleteAllTutoringClasses().then(() => {
        res.send("Deleted all tutoring classes");
    });
})

router.get('/tutoring-classes', function(req, res) {
    getAllTutoringClasses().then((queryResponse) => {
        res.status(queryResponse.code);
        res.send(queryResponse.data);
    });
})

router.get('/tutoring-classes/:id', function(req, res) {
    getTutoringClassById(req.params.id).then((queryResponse) => {
        res.status(queryResponse.code);
        res.send(queryResponse.data);
    });
})

router.post('/tutoring-classes', function(req, res) {
    let token = req.headers.authorization.slice(7);
    let user = validateToken(token);
    if (user === null || user.role !== "teacher") {
        res.status(403);
        res.send(createMessage("You are not authorized to add a tutoring class"));
    } else {
        let tutoringClass = req.body;
        tutoringClass.teacher_id = user.id;
        addTutoringClass(tutoringClass).then((queryResponse) => {
            res.status(queryResponse.code);
            res.send(queryResponse.data);
        });
    }
})

router.delete('/tutoring-classes/:id', function(req, res) {
    deleteTutoringClass(req.params.id).then((queryResponse) => {
        res.status(queryResponse.code);
        res.send(queryResponse.data);
    });
})

router.patch('/tutoring-classes/:id', function(req, res) {
    let newDescription = req.body.description;
    updateTutoringClass(req.params.id, newDescription).then((queryResponse) => {
        res.status(queryResponse.code);
        res.send(queryResponse.data);
    });
});

module.exports = router;
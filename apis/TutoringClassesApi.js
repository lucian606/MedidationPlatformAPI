require('dotenv').config();
const { response } = require('express');
const TutoringClasses = require('../models/TutoringClass');
const Users = require('../models/Users.js');
const { createMessage } = require('./CommonApi.js');

async function deleteAllTutoringClasses() {
    await TutoringClasses.deleteMany({}, {});
    console.log("All tutoring classes deleted");
}

async function getAllTutoringClasses() {
    let result = {code: 200, data: []};
    try {
        let tutoringClasses = await TutoringClasses.find({}, {_id: 0});
        result.data = tutoringClasses;
    } catch (err) {
        console.log(err);
        result.code = 500;
        result.data = createMessage("An error has occured while getting all tutoring classes");
    }
    return result;
}

async function getTutoringClassById(id) {
    let result = {code: 200, data: []};
    try {
        let tutoringClass = await TutoringClasses.find({id: id}, {_id: 0});
        if (tutoringClass == null || tutoringClass == undefined || tutoringClass.length == 0) {
            result.code = 404;
            result.data = createMessage("Tutoring class not found");
        } else {
            result.data = tutoringClass;
        }
    } catch (err) {
        console.log(err);
        result.code = 500;
        result.data = createMessage("An error has occured while getting tutoring class with id");
    }
    return result;  
}

async function addTutoringClass(tutoringClassData) {
    let result = {code: 200, data: []};
    try {
        let teacher_id = tutoringClassData.teacher_id;
        let teacher = await Users.find({id: teacher_id, role: 'teacher'}, {_id: 0});
        if (teacher == null || teacher == undefined || teacher.length == 0) {
            result.code = 404;
            result.data = createMessage("Teacher not found");
        } else {
            try {
                let newTutoringClass = await TutoringClasses.create(tutoringClassData);
                tutoringClassData.id = newTutoringClass.id;
                let user_classes = teacher[0].tutoring_classes;
                user_classes.push(tutoringClassData);
                let updatedClasses = {tutoring_classes: user_classes};
                await Users.updateOne({id: teacher_id, role: 'teacher'}, {$set : updatedClasses}, {upsert : false, useFindAndModify: false, runValidators : true});
                result.code = 201;
                result.data = createMessage("Tutoring class created");
            } catch (err) {
                console.log(err);
                result.code = 400;
                result.data = createMessage("Invalid body");
            }
        }
    } catch (err) {
        console.log(err);
        result.code = 500;
        result.data = createMessage("An error has occured while adding tutoring class");
    }
    return result;
};

async function deleteTutoringClass(id) {
    let result = {code: 200, data: []};
    try {
        let tutoringClass = await TutoringClasses.find({id: id});
        if (tutoringClass == null || tutoringClass == undefined || tutoringClass.length == 0) {
            result.code = 404;
            result.data = createMessage("Tutoring class not found");
        } else {
            let teacher_id = tutoringClass[0].teacher_id;
            let teacher = await Users.find({id: teacher_id, role: 'teacher'});
            let new_tutoring_classes = teacher[0].tutoring_classes.filter(tutoring_class => tutoring_class.id != id);
            await Users.findOneAndUpdate({id: teacher_id, role: 'teacher'}, {$set : {tutoring_classes: new_tutoring_classes}}, {upsert : false, useFindAndModify: false, runValidators : true});
            let users = tutoringClass[0].users;
            for (let i = 0; i < users.length; i++) {
                let user = await Users.find({id: users[i]});
                console.log(id);
                let new_classes = user[0].tutoring_classes.filter(tutoring_class => tutoring_class != id);
                console.log(new_classes);
                await Users.findOneAndUpdate({id: users[i]}, {$set : {tutoring_classes: new_classes}}, {upsert : false, useFindAndModify: false, runValidators : true});
            }
            await TutoringClasses.deleteOne({id: id});
            result.data = createMessage("Tutoring class deleted");
        }
    } catch (err) {
        console.log(err);
        result.code = 500;
        result.data = createMessage("An error has occured while deleting tutoring class");
    }
    return result;
}

async function updateTutoringClass(id, description) {
    let result = {code: 200, data: []};
    if (typeof description !== 'string') {
        result.code = 400;
        result.data = createMessage("Description must be string");
    } else {
        try {
            let tutoringClass = await TutoringClasses.find({id: id});
            if (tutoringClass == null || tutoringClass == undefined || tutoringClass.length == 0) {
                result.code = 404;
                result.data = createMessage("Tutoring class not found");
            } else {
                let teacher_id = tutoringClass[0].teacher_id;
                let teacher = await Users.find({id: teacher_id, role: 'teacher'});
                let new_tutoring_classes = teacher[0].tutoring_classes.map(function(tutoring_class) {
                    if (tutoring_class.id == id) {
                        tutoring_class.description = description;
                    }
                    return tutoring_class;
                });
                await Users.findOneAndUpdate({id: teacher_id, role: 'teacher'}, {$set : {tutoring_classes: new_tutoring_classes}}, {upsert : false, useFindAndModify: false, runValidators : true});
                await TutoringClasses.updateOne({id: id}, {$set : {description: description}}, {upsert : false, useFindAndModify: false, runValidators : true});
                result.data = createMessage("Tutoring class updated");
            }
        } catch (err) {
            console.log(err);
            result.code = 500;
            result.data = createMessage("An error has occured while updating tutoring class");
        }
    }
    return result;
}

async function enrollStudent(id, studentId) {
    let result = {code: 200, data: []};
    try {
        let tutoringClass = await TutoringClasses.find({id: id});
        if (tutoringClass == null || tutoringClass == undefined || tutoringClass.length == 0) {
            result.code = 404;
            result.data = createMessage("Tutoring class not found");
        } else {
            let student = await Users.find({id: studentId, role: 'student'});
            let new_tutoring_classes = student[0].tutoring_classes;
            let new_users = tutoringClass[0].users;
            new_tutoring_classes.push(id);
            new_users.push(studentId);
            await TutoringClasses.updateOne({id: id}, {$set : {users: new_users}}, {upsert : false, useFindAndModify: false, runValidators : true});
            await Users.updateOne({id: studentId, role: 'student'}, {$set : {tutoring_classes: new_tutoring_classes}}, {upsert : false, useFindAndModify: false, runValidators : true});
            result.data = createMessage("Student enrolled");
        }
    } catch (err) {
        console.log(err);
        result.code = 500;
        result.data = createMessage("An error has occured while enrolling student");
    }
    return result;
}

module.exports = { deleteAllTutoringClasses, getAllTutoringClasses, getTutoringClassById, addTutoringClass, deleteTutoringClass, updateTutoringClass, enrollStudent };
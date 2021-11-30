const Users = require('../models/Users.js');
const jwt = require("jsonwebtoken");
const studentRegex = /[a-z0-9\._%+!$&*=^|~#%{}/\-]+@stud.upb.ro/
const teacherRegex = /[a-z0-9\._%+!$&*=^|~#%{}/\-]+@onmicrosoft.upb.ro/
const {getAllReviews, getReview, deleteReview, updateReview, addReview} = require('./ReviewsApi.js');

function validateEmail(role, email) {
    if (role === "teacher") {
        return teacherRegex.test(email)
    } else if (role == "student") {
        return studentRegex.test(email)
    } else {
        return false;
    }
}

function createMessage(msg) {
    return {message : msg};
}

function deleteAllUsers() {
    Users.deleteMany({}, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Cleared Users DB");
        }
    });
}

async function getAllUsers() {
    let result = {code: 200, data : {}};
    try {
        let users = await Users.find({}, {_id: 0, password: 0});
        result.data = users;
    } catch (err) {
        console.log(err);
        result.code = 500;
        result.data = createMessage("An error has occured while getting all users");
    }
    return result;
}

async function getUserWithId(id) {
    let result = {code: 200, data : {}};
    try {
        let user = await Users.findOne({id: id}, {_id: 0, password: 0});
        if (user == null || user == undefined || user.length == 0) {
            result.code = 404;
            result.data = createMessage("No user with the given id");
        } else {
            result.data = user;
        }
    } catch (err) {
        console.log(err);
        result.code = 500;
        result.data = createMessage("An error has occured while getting the user with id");
    }
    return result;     
}

async function deleteUser(id) {
    let result = {code: 200, data : {}};
    try {
        let user = await Users.find({id: id});
        let reviews = user[0].reviews;
        for (let i = 0; i < reviews.length; i++) {
            await deleteReview(reviews[i].id);
        }
        let removeSuccess = await Users.deleteOne({id: id});
        if (removeSuccess.deletedCount == 0) {
            result.code = 404;
            result.data = createMessage("No user with the given id");
        } else {
            result.data = createMessage("User deleted");
        }
    } catch (err) {
        console.log(err);
        result.code = 500;
        result.data = createMessage("An error has occured while deleting the user with id");
    }
    return result;
}

async function registerUser(userData) {
    let result = {code: 200, data : {}};
    if (userData.password !== userData.confirmation_password) {
        result.code = 400;
        result.data = createMessage("Passwords don't match");
    } else if (!validateEmail(userData.role, userData.email)) {
        result.code = 400;
        result.data = createMessage("Email doesn't match the role");     
    } else {
        try {
        await Users.create(userData);
        result.code = 201;
        result.data = createMessage("User created");
        } catch (err) {
            result.code = 400;
            result.data = createMessage("Invalid user body");
        }
    }
    return result;
}

async function loginUser(userCredidentials) {
    let result = {code: 200, data : {}};
    if (typeof userCredidentials.email !== 'string' || typeof userCredidentials.password !== 'string') {
        result.code = 400;
        result.data = createMessage("Invalid user login body");
    } else {
        try {
            let user = await Users.find({email : userCredidentials.email, password : userCredidentials.password});
            if (user == null || user == undefined || user.length == 0) {
                result.code = 401;
                result.data = createMessage("Invalid user credentials");
            } else {
                const token = jwt.sign({
                    'email': userCredidentials.email}, 
                    process.env.TOKEN_SECRET,
                    {expiresIn : 1800});
                result.data = {token : token};
            }
        } catch (err) {
            console.log(err);
            result.code = 500;
            result.data = createMessage("An error has occured while logging in the user");
        }
    }

    return result;
}

async function updateUser(id, updatedContent) {
    let result = {code: 200, data : {}};
    try {
        let user = await Users.find({id: id});
        if (user == null || user == undefined || user.length == 0) {
            result.code = 404;
            result.data = createMessage("No user with the given id");
        } else {
            user = user[0]
            let role = updatedContent.role ? updatedContent.role : user.role;
            let email = updatedContent.email ? updatedContent.email : user.email;
            updatedContent.id = id;
            if (!validateEmail(role, email)) {
                result.code = 400;
                result.data = createMessage("Email doesn't match the role");
            } else if (updatedContent.password && updatedContent.password !== updatedContent.confirmation_password) {
                result.code = 400;
                result.data = createMessage("Passwords don't match");
            } else {
                try {
                    await Users.findOneAndUpdate({id : id}, {$set : updatedContent }, {upsert : false, useFindAndModify: false, runValidators : true});
                    result.code = 200;
                    result.data = createMessage("User updated");
                } catch (err) {
                    console.log(err);
                    result.code = 400;
                    result.data = createMessage("Invalid user body");
                }
            }
        }
    } catch (err) {
        console.log(err);
        result.code = 500;
        result.data = createMessage("An error has occured while updating the user");
    }
    return result;
}

module.exports = { deleteAllUsers, getAllUsers, getAllUsers, getUserWithId, deleteUser, registerUser, loginUser, updateUser};
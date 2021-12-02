require('dotenv').config();
const Users = require('../models/Users.js');
const TutoringClasses = require('../models/TutoringClass.js');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const studentRegex = /[a-z0-9\._%+!$&*=^|~#%{}/\-]+@stud.upb.ro/
const teacherRegex = /[a-z0-9\._%+!$&*=^|~#%{}/\-]+@onmicrosoft.upb.ro/
const {getAllReviews, getReview, deleteReview, updateReview, addReview} = require('./ReviewsApi.js');
const {deleteTutoringClass} = require('./TutoringClassesApi.js');
const {createMessage, validateEmail} = require('./CommonApi.js');

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
        if (user == null || user == undefined || user.length == 0) {
            result.code = 404;
            result.data = createMessage("No user with the given id");
        } else {
            let reviews = user[0].reviews;
            let tutoring_classes = user[0].tutoring_classes;
            for (let i = 0; i < reviews.length; i++) {
                await deleteReview(reviews[i].id);
            }
            if (user[0].role === 'teacher') {
                for (let i = 0; i < tutoring_classes.length; i++) {
                    await deleteTutoringClass(tutoring_classes[i].id);
                }
            } else {
                for (let i = 0; i < tutoring_classes.length; i++) {
                    let tutoring_class = await TutoringClasses.find({id: tutoring_classes[i]});
                    let new_users = tutoring_class[0].users.filter(user => user != id);
                    await TutoringClasses.updateOne({id: tutoring_classes[i]}, {users: new_users});
                }
            }
            await Users.deleteOne({id: id});
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
    if (userData.password !== userData.confirmation_password || userData.password.length < 8 || userData.password.length > 50) {
        result.code = 400;
        result.data = createMessage("Passwords don't match");
    } else if (!validateEmail(userData.role, userData.email)) {
        result.code = 400;
        result.data = createMessage("Email doesn't match the role");     
    } else {
        try {
            try {
                let hash = await bcrypt.genSalt(process.env.SALT_ROUNDS);
                let hashedPassword = await bcrypt.hash(userData.password, hash);
                userData.password = hashedPassword;
                userData.hash = hash;
                await Users.create(userData);
                result.code = 201;
                result.data = createMessage("User created");
            } catch (err) {
                console.log(err);
                result.code = 500;
                result.data = createMessage("An error has occured while creating the user");
            }
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
            let user = await Users.find({email : userCredidentials.email});
            if (user == null || user == undefined || user.length == 0) {
                result.code = 401;
                result.data = createMessage("Invalid user credentials");
            } else {
                let isValid = await bcrypt.compare(userCredidentials.password, user[0].password);
                if (isValid == true) {
                const token = jwt.sign({
                        'email': userCredidentials.email, 'id' : user[0].id, 'role' : user[0].role}, 
                        process.env.TOKEN_SECRET,
                        {expiresIn : 1800});
                    result.data = {token : token};
                } else {
                    result.code = 401;
                    result.data = createMessage("Invalid user credentials");
                }
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
            } else if (updatedContent.password && (updatedContent.password !== updatedContent.confirmation_password || updatedContent.password.length < 8 || updatedContent.password.length > 50)) {
                result.code = 400;
                result.data = createMessage("Passwords don't match or don't have a lenght between 8 and 50 characters");
            } else {
                try {
                    if (updatedContent.password) {
                        let hash = await bcrypt.genSalt(process.env.SALT_ROUNDS);
                        let hashedPassword = await bcrypt.hash(updatedContent.password, hash);
                        updatedContent.password = hashedPassword;
                    }
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
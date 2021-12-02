require('dotenv').config();
const jwt = require("jsonwebtoken");
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

function createMessage(msg) {
    return {message : msg};
}

function validateToken(token) {
    try {
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET)
        return decoded;
    } catch (err) {
        console.log(err);
        return null;
    }
}


module.exports = {validateEmail, createMessage, validateToken};
require('dotenv').config();
const jwt = require("jsonwebtoken");

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
        return "Error";
    }
}


module.exports = {validateEmail, createMessage, validateToken};
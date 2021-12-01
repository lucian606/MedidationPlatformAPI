const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    id: {
        type: Number,
        default: Date.now,
        unique: true
    },
    lastname: {
        type: String,
        required: true,
        maxLength: 50
    },
    firstname: {
        type: String,
        required: true,
        maxLength: 50
    },    
    email: {
        type: String,
        required: true,
        maxLength: 50,
        unique: true,
        match: /[a-z0-9\._%+!$&*=^|~#%{}/\-]+@([a-z0-9\-]+\.){1,}([a-z]{2,22})/
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 50
    },
    role: {
        type: String,
        required: true,
        enum: ['teacher', 'student'],
        maxLength: 50
    },    
    reviews: {
        type: Array,
        default: []
    },
    tutoring_classes: {
        type: Array,
        default: []
    }

},
    {
        versionKey: false
    }
);

module.exports = mongoose.model('User', UserSchema, 'Users');
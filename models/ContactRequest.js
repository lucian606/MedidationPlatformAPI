const mongoose = require('mongoose');

const ContactRequestSchema = new mongoose.Schema({
    id: {
        type: Number,
        default: Date.now,
        unique: true
    },
    name: {
        type: String,
        required: true,
        maxLength: 50
    },
    email: {
        type: String,
        required: true,
        maxLength: 50,
        match: /[a-z0-9\._%+!$&*=^|~#%{}/\-]+@([a-z0-9\-]+\.){1,}([a-z]{2,22})/
    },
    message: {
        type: String,
        required: true,
        maxLength: 5000
    },
    is_resolved: {
        type: Boolean,
        default: false,
    },
},
    {
        versionKey: false
    }
);

module.exports = mongoose.model('ContactRequest', ContactRequestSchema, 'ContactRequests');
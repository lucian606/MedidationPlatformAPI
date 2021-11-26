const mongoose = require('mongoose');

const ContactRequestSchema = new mongoose.Schema({

    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    is_resolved: {
        type: Boolean,
        default: false,
    },

});

module.exports = mongoose.model('ContactRequest', ContactRequestSchema);
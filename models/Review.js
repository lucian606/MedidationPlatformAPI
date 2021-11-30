const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    id: {
        type: Number,
        default: Date.now,
        unique: true
    },
    message: {
        type: String,
        required: true,
        maxLength: 5000
    },
    user_id: {
        type: Number
    },
},
    {
        versionKey: false
    }
);

module.exports = mongoose.model('Review', ReviewSchema, 'Reviews');
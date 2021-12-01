const mongoose = require('mongoose');

const TutoringClassSchema = new mongoose.Schema({
    id: {
        type: Number,
        default: Date.now,
        unique: true
    },
    description: {
        type: String,
        required: true,
        maxLength: 500
    },
    subject: {
        type: String,
        required: true,
        maxLength: 80
    },
    teacher_id: {
        type: Number,
        required: true
    },
},
    {
        versionKey: false
    }
);

module.exports = mongoose.model('TutoringClass', TutoringClassSchema, 'TutoringClasses');
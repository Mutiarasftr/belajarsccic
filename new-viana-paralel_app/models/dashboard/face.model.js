const mongoose = require('mongoose');

const faceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    id_tag: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    birth_date: {
        type: Date,
        required: true
    },
    nationality: {
        type: String,
        require: true
    },
    status: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Face', faceSchema);
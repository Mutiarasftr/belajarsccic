const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const site2Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    cameraId: [{
        type: ObjectId,
        ref: 'Camera'
    }]
});

module.exports = mongoose.model('Site2', site2Schema);
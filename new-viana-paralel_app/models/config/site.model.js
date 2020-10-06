const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const siteSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Site', siteSchema);
const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const faceSchema = new mongoose.Schema({
    event: {
        eventId: {
            type: ObjectId,
            ref: 'Event'
        },
        camera_name: String,
    },
    face: [
        {
            name: String,
            class: String,
            date: Date,
            images: String,
            camera_name: String
        }
    ]
});

module.exports = mongoose.model('Event_Face', faceSchema);
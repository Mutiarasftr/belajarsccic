const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const objectSchema = new mongoose.Schema({
    event: {
        eventId: {
            type: ObjectId,
            ref: 'Event'
        },
        camera_name: String,
    },
    object: [
        {
            data: [
                {
                    object: String,
                    count: Number
                }
            ],
            date: Date
        }
    ]
});

module.exports = mongoose.model('Event_Object', objectSchema);
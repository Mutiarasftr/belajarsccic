const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const covidSchema = new mongoose.Schema({
    event: {
        eventId: {
            type: ObjectId,
            ref: 'Event'
        },
        camera_name: String,
    },
    covid: [
        {
            tota_p: Number,
            low_risk_p: Number,
            high_risk_p: Number,
            save_p: Number,
            date: Date
        }
    ]
});

module.exports = mongoose.model('Event_Covid', covidSchema);
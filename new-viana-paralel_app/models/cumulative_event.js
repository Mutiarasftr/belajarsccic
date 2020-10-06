const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const cumSchema = new mongoose.Schema({
    event: {
        eventId: {
            type: ObjectId,
            ref: 'Event'
        },
        camera_name: String,
    },
    count: [
        {
            res: [
                {
                    roi: String,
                    total: Number,
                    data: [
                        {
                            object: String,
                            count: Number
                        }
                    ]
                }
            ],
            date: Date
        }
    ]
});

module.exports = mongoose.model('Event_Cumulative', cumSchema);
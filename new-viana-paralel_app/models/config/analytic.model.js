const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const analyticSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    eventId:[{
        type: ObjectId,
        ref: 'Event'
    }]
});

module.exports = mongoose.model('Analytic', analyticSchema);
const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const eventSchema = mongoose.Schema({
    port: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true,
        default: 0
    },
    pid: {
        type: String,
        default: null
    },
    process: {
        type: Boolean,
        required: true,
        default: 0
    },
    statTrans: {
        type: Boolean,
        default: 0
    },
    description: {
        type: String,
    },
    cameraId: {
        type: ObjectId,
        ref: 'Camera'
    },
    analyticId: {
        type: ObjectId,
        ref: 'Analytic'
    },
    transId: {
        type: ObjectId,
        refPath: 'connections.kind'
    }
});

module.exports = mongoose.model('Event', eventSchema);
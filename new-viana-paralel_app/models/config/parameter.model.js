const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const parameterSchema = new mongoose.Schema({
    nama_parameter: {
        type: String,
        required: true
    },
    value_parameter: {
        type: String,
        required: true
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
        refPart: 'connection.kind'
    }
});

module.exports = mongoose.model('Parameter', parameterSchema);

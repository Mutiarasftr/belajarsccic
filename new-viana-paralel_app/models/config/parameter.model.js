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
    }
});

module.exports = mongoose.model('Parameter', parameterSchema);
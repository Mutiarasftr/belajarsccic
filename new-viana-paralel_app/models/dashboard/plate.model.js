const mongoose = require('mongoose');

const plateSchema = new mongoose.Schema({
    plate_number: {
        type: String,
        require: true
    },
    type: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    owner_name: {
        type: String,
        required: true
    },
    owner_nik: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model('Plate', plateSchema);
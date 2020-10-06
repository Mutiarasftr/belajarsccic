const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const cameraSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    location: {
        latitude: {
            type: String,
            required: true
        },
        longitude: {
            type: String,
            required: true
        },
    },
    address: {
        type: String,
    },
    protocol: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum : ['active','inactive'],
        default: 'inactive',
        required: true
    },
    vector: {
        d: {
         type: String,
         default: 'M190.387,134.138l-27.415,42.051l-42.642-27.73l-15.554,26.596L38,180.884v46.391H0v-120h38v43.494l48.664-4.244  l8.575-14.453L36.887,94.088l51.544-79.183l153.748,100.082L190.387,134.138z M173.874,183.244l19.924,12.971l27-41.474  l-19.924-12.971L173.874,183.244z'
        },
        transform: {
            type: String
        }
    },
    siteId: {
        type: ObjectId,
        ref: 'Site'
    },
    eventId: [{
        type: ObjectId,
        ref: 'Event'
    }]
});

module.exports = mongoose.model('Camera', cameraSchema);
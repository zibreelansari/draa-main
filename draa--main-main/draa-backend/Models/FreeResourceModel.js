const mongoose = require('mongoose');

const freeResourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Name is required'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true,'Phone number is required'],
    },
    resource_type: {
        type: String,
        required: true,
    },
    resource_title: {
        type: String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('FreeResourceLead', freeResourceSchema);

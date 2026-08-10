// Models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Name is required'],
        trim: true,
        maxlength: [100,'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true,'Email is required'],
        trim: true,
        lowercase: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
'Please enter a valid email address'
        ]
    },
    subject: {
        type: String,
        required: [true,'Subject is required'],
        trim: true,
        maxlength: [200,'Subject cannot exceed 200 characters']
    },
    phone: {
        type: String,
        required: [true,'Phone number is required'],
        trim: true,
        match: [/^\+?[1-9]\d{1,14}$/,'Please enter a valid phone number']
    },
    message: {
        type: String,
        required: [true,'Message is required'],
        trim: true,
        maxlength: [2000,'Message cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: ['new','read','replied','resolved'],
        default:'new'
    },
    priority: {
        type: String,
        enum: ['low','medium','high','urgent'],
        default:'medium'
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for better search performance
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1, priority: 1 });
contactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);

const mongoose = require('mongoose');

const supportAgentSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admins',
        required: true,
        unique: true
    },
    skills: [{
        type: String, // e.g. 'Technical', 'Billing', 'Course Content', 'Exam Issue'
    }],
    isActive: {
        type: Boolean,
        default: false // Online status to receive assigned tickets
    },
    currentLoad: {
        type: Number,
        default: 0
    },
    maxCapacity: {
        type: Number,
        default: 10
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SupportAgent', supportAgentSchema);

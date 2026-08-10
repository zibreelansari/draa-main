const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath:'messages.senderModel'
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['User','Teacher','admins']
    },
    text: {
        type: String,
        required: true
    },
    attachments: [String],
    timestamp: {
        type: Date,
        default: Date.now
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    }
});

const supportTicketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        unique: true,
        required: true
    },
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath:'requesterRole'
    },
    requesterRole: {
        type: String,
        required: true,
        enum: ['User','Teacher']
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Technical','Billing','Course Content','Exam Issue','Other']
    },
    priority: {
        type: String,
        enum: ['Low','Medium','High','Urgent'],
        default:'Medium'
    },
    status: {
        type: String,
        enum: ['Open','In Progress','Resolved','Closed'],
        default:'Open'
    },
    assignedAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'admins'
    },
    messages: [supportMessageSchema],
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    channel: {
        type: String,
        enum: ['WhatsApp', 'Email', 'In-App', 'Web-Chat'],
        required: true,
        default: 'In-App'
    },
    currentTier: {
        type: String,
        enum: ['L1', 'L2', 'L3'],
        default: 'L1'
    },
    sourceIdentifier: {
        type: String,
        index: true
    },
    slaDueDate: {
        type: Date
    },
    slaBreached: {
        type: Boolean,
        default: false
    },
    assignedAgentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admins'
    },
    metadata: {
        browser: String,
        os: String,
        appVersion: String,
        deviceModel: String
    },
    satisfactionScore: {
        type: Number,
        min: 1,
        max: 5
    },
    satisfactionFeedback: {
        type: String
    }
}, {
    timestamps: true
});

// Auto-generate ticket ID before validation
supportTicketSchema.pre('validate', async function (next) {
    if (this.isNew && !this.ticketId) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2,'0');
        const random = Math.floor(1000 + Math.random() * 9000);
        this.ticketId = `TKT-${year}${month}-${random}`;
    }
    next();
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);

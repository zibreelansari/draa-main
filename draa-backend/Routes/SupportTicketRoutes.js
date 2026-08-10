const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
    createTicket, 
    getTickets, 
    getTicketById, 
    addMessage, 
    updateTicketStatus,
    markMessagesAsRead
} = require('../Controllers/SupportTicketController');
const { universalAuth } = require('../Middlewares/universalAuth');

// Configure Multer for Support Attachments
const uploadDir ='uploads/support';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() +'-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname +'-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes
router.post('/', universalAuth, upload.array('attachments', 5), createTicket);
router.post('/create', universalAuth, upload.array('attachments', 5), createTicket);
router.get('/', universalAuth, getTickets);
router.get('/list', universalAuth, getTickets);
router.get('/:id', universalAuth, getTicketById);
router.post('/:id/message', universalAuth, upload.array('attachments', 5), addMessage);
router.put('/:id/status', universalAuth, updateTicketStatus);
router.put('/:id/read', universalAuth, markMessagesAsRead);

module.exports = router;

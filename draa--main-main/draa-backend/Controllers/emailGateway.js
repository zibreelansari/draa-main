const SupportTicket = require('../Models/SupportTicketModel');
const User = require('../Models/UserModel');
const Teacher = require('../Models/TeacherModel');
const aiTriageController = require('./aiTriageController');
const { sendWhatsAppMessage } = require('./whatsappGateway'); // standard reference

// Helper to send reply email using supportTransporter
const sendSupportEmail = async (to, subject, text, ticketRef) => {
    try {
        const mailConfig = require('../utils/mailConfig');
        const replySubject = subject.includes(ticketRef) ? subject : `Re: [Support] Ticket [${ticketRef}] - ${subject}`;
        
        console.log(`[SMTP OUTBOUND] Sending support reply to ${to} subject "${replySubject}"`);
        
        if (mailConfig.supportTransporter) {
            await mailConfig.supportTransporter.sendMail({
                from: `"Draa Support" <${process.env.SUPPORT_SMTP_USER || 'support@draa.in'}>`,
                to,
                subject: replySubject,
                text
            });
        } else {
            console.warn('[SMTP WARNING] supportTransporter is not configured in mailConfig.');
        }
        return { success: true };
    } catch (err) {
        console.error('SMTP send error:', err.message);
        return { success: false, error: err.message };
    }
};

exports.receiveInboundEmail = async (req, res) => {
    try {
        const payload = req.body;
        
        // Extract fields depending on common email webhook parses (like SendGrid or Mailgun)
        const from = payload.from || payload.sender; // "Sender Name <sender@email.com>" or just "sender@email.com"
        const subject = payload.subject || '';
        const bodyText = payload.text || payload['body-plain'] || '';
        
        if (!from || !subject) {
            return res.status(400).json({ success: false, message: 'Missing from or subject' });
        }

        // Clean sender email address
        const emailMatch = from.match(/<([^>]+)>/);
        const senderEmail = emailMatch ? emailMatch[1].trim() : from.trim();

        console.log(`[Email INBOUND] From: ${senderEmail}, Subject: "${subject}"`);

        // Find associated user or teacher in Draa
        let requesterId = null;
        let requesterRole = 'User';
        let requesterName = 'Email Student';

        const user = await User.findOne({ email: senderEmail });
        if (user) {
            requesterId = user._id;
            requesterRole = 'User';
            requesterName = user.name || requesterName;
        } else {
            const teacher = await Teacher.findOne({ temail: senderEmail });
            if (teacher) {
                requesterId = teacher._id;
                requesterRole = 'Teacher';
                requesterName = teacher.tname || 'Email Teacher';
            }
        }

        // Thread matching: Look for ticket ID in the subject line (e.g. [TKT-2606-4039])
        const ticketIdMatch = subject.match(/\[(TKT-\d{4}-\d{4})\]/);
        let ticket = null;

        if (ticketIdMatch) {
            const extractedTicketId = ticketIdMatch[1];
            ticket = await SupportTicket.findOne({ ticketId: extractedTicketId });
        }

        // If no matching ticket, search for any open email ticket from this sender
        if (!ticket) {
            ticket = await SupportTicket.findOne({
                channel: 'Email',
                sourceIdentifier: senderEmail,
                status: { $ne: 'Closed' }
            });
        }

        const isNewTicket = !ticket;

        if (isNewTicket) {
            ticket = new SupportTicket({
                requesterId: requesterId || new mongoose.Types.ObjectId(),
                requesterRole: requesterRole,
                subject: subject,
                category: 'Other',
                channel: 'Email',
                sourceIdentifier: senderEmail,
                status: 'Open',
                currentTier: 'L1',
                messages: []
            });
        }

        // Add email body text to ticket conversation
        ticket.messages.push({
            senderId: requesterId || ticket._id,
            senderModel: requesterRole,
            text: bodyText,
            timestamp: new Date()
        });
        ticket.lastMessageAt = new Date();

        await ticket.save();

        // Trigger socket alert for real-time dashboard monitoring
        try {
            const io = req.app.get('io');
            if (io) {
                io.emit('new_support_ticket', {
                    ticketId: ticket._id,
                    ticketRef: ticket.ticketId,
                    subject: ticket.subject,
                    from: requesterName,
                    role: requesterRole,
                    channel: 'Email'
                });
            }
        } catch (socketErr) {
            console.error('Socket notification error on Email webhook:', socketErr.message);
        }

        // Handle routing based on tier
        if (ticket.currentTier === 'L1') {
            // Execute AI auto-reply
            const aiResponse = await aiTriageController.processL1Message(ticket, bodyText, requesterName);

            ticket.messages.push({
                senderId: ticket._id,
                senderModel: 'User',
                text: aiResponse,
                timestamp: new Date()
            });
            await ticket.save();

            // Email the L1 AI solution back
            await sendSupportEmail(senderEmail, ticket.subject, aiResponse, ticket.ticketId);
        } else {
            // Escalated - let active dashboard updates take over.
            try {
                const io = req.app.get('io');
                if (io) {
                    io.to(ticket._id.toString()).emit('ticket_notification', {
                        ticketId: ticket._id.toString(),
                        ticketRef: ticket.ticketId,
                        senderName: requesterName,
                        text: bodyText,
                        isAdmin: false
                    });
                }
            } catch (socketErr) {
                console.error('Socket notify L2 error on Email incoming:', socketErr.message);
            }
        }

        res.status(200).json({ success: true, ticketId: ticket.ticketId });
    } catch (error) {
        console.error('Inbound Email receive error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Send email response from dashboard
exports.replyFromDashboard = async (ticketId, replyText) => {
    try {
        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket || ticket.channel !== 'Email') {
            throw new Error('Valid email support ticket not found');
        }

        await sendSupportEmail(ticket.sourceIdentifier, ticket.subject, replyText, ticket.ticketId);
        return true;
    } catch (error) {
        console.error('Dashboard Email reply error:', error.message);
        return false;
    }
};

module.exports.sendSupportEmail = sendSupportEmail;

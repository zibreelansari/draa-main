const SupportTicket = require('../Models/SupportTicketModel');
const User = require('../Models/UserModel');
const Teacher = require('../Models/TeacherModel');
const aiTriageController = require('./aiTriageController');

// Helper to format/send WhatsApp response (mocked or Meta/Twilio Cloud API wrapper)
const sendWhatsAppMessage = async (to, text) => {
    // In production, invoke Meta Cloud API or Twilio API:
    // axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, { ... })
    console.log(`[WhatsApp API OUTBOUND] Sent to ${to}: "${text}"`);
    return { success: true, messageId: `msg_${Date.now()}` };
};

exports.webhookVerify = (req, res) => {
    // Standard Meta Cloud Webhook Verification
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === (process.env.WHATSAPP_VERIFY_TOKEN || 'draa_secret_token')) {
            console.log('WhatsApp Webhook verified successfully.');
            return res.status(200).send(challenge);
        }
        return res.status(403).sendStatus(403);
    }
    return res.status(400).send('Bad Request');
};

exports.webhookReceive = async (req, res) => {
    try {
        const body = req.body;
        
        // Handle Meta/Twilio structure parsing
        let fromNumber = '';
        let messageText = '';

        if (body.object === 'whatsapp_business_account' && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
            const message = body.entry[0].changes[0].value.messages[0];
            fromNumber = message.from; // Phone number format: 919999999999
            messageText = message.text?.body || '[Attachment/Media Unsupported]';
        } else if (body.From && body.Body) {
            // Twilio format fallback
            fromNumber = body.From.replace('whatsapp:', '');
            messageText = body.Body;
        } else {
            // Non-WhatsApp event or status update
            return res.sendStatus(200);
        }

        if (!fromNumber || !messageText) {
            return res.sendStatus(200);
        }

        console.log(`[WhatsApp INBOUND] From: ${fromNumber}, Msg: "${messageText}"`);

        // Find associated user or teacher by phone number
        let requesterId = null;
        let requesterRole = 'User';
        let requesterName = 'WhatsApp Student';

        const user = await User.findOne({ $or: [{ phone: fromNumber }, { mobile: fromNumber }] });
        if (user) {
            requesterId = user._id;
            requesterRole = 'User';
            requesterName = user.name || requesterName;
        } else {
            const teacher = await Teacher.findOne({ $or: [{ phone: fromNumber }, { mobile: fromNumber }] });
            if (teacher) {
                requesterId = teacher._id;
                requesterRole = 'Teacher';
                requesterName = teacher.tname || 'WhatsApp Teacher';
            }
        }

        // Search for an open WhatsApp ticket from this sender
        let ticket = await SupportTicket.findOne({
            channel: 'WhatsApp',
            sourceIdentifier: fromNumber,
            status: { $ne: 'Closed' }
        });

        const isNewTicket = !ticket;

        if (isNewTicket) {
            ticket = new SupportTicket({
                requesterId: requesterId || new mongoose.Types.ObjectId(), // fallback identifier
                requesterRole: requesterRole,
                subject: `WhatsApp Chat with ${requesterName}`,
                category: 'Other',
                channel: 'WhatsApp',
                sourceIdentifier: fromNumber,
                status: 'Open',
                currentTier: 'L1',
                messages: []
            });
        }

        // Add message to ticket history
        ticket.messages.push({
            senderId: requesterId || ticket._id, // fallback self-reference if anonymous
            senderModel: requesterRole,
            text: messageText,
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
                    channel: 'WhatsApp'
                });
            }
        } catch (socketErr) {
            console.error('Socket notification error on WhatsApp webhook:', socketErr.message);
        }

        // Route conversation based on tier
        if (ticket.currentTier === 'L1') {
            // AI Response processing
            const aiResponse = await aiTriageController.processL1Message(ticket, messageText, requesterName);
            
            // Append AI message response to ticket
            ticket.messages.push({
                senderId: ticket._id, // self-ref for bot replies
                senderModel: 'User', // default modeling for fallback
                text: aiResponse,
                timestamp: new Date()
            });
            await ticket.save();

            // Send reply message back through WhatsApp
            await sendWhatsAppMessage(fromNumber, aiResponse);
        } else {
            // Escalated L2/L3 - human is handling. Do not auto-respond, wait for agent dashboard entry.
            // Notify assigned agent of the message in the ticket
            try {
                const io = req.app.get('io');
                if (io) {
                    io.to(ticket._id.toString()).emit('ticket_notification', {
                        ticketId: ticket._id.toString(),
                        ticketRef: ticket.ticketId,
                        senderName: requesterName,
                        text: messageText,
                        isAdmin: false
                    });
                }
            } catch (socketErr) {
                console.error('Socket notify L2 error on WhatsApp incoming:', socketErr.message);
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('WhatsApp Webhook receive error:', error);
        res.sendStatus(500);
    }
};

// Outbound response from Admin portal to WhatsApp user
exports.replyFromDashboard = async (ticketId, replyText) => {
    try {
        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket || ticket.channel !== 'WhatsApp') {
            throw new Error('Valid WhatsApp support ticket not found');
        }

        await sendWhatsAppMessage(ticket.sourceIdentifier, replyText);
        return true;
    } catch (error) {
        console.error('WhatsApp Outbound error:', error.message);
        return false;
    }
};

module.exports.sendWhatsAppMessage = sendWhatsAppMessage;

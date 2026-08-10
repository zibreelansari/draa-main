const SupportTicket = require('../Models/SupportTicketModel');
const User = require('../Models/UserModel');
const Teacher = require('../Models/TeacherModel');
const Admin = require('../Models/AdminModel');

// Create a new ticket
exports.createTicket = async (req, res) => {
    try {
        const { subject, category, priority, message } = req.body;
        const requesterId = req.user?._id || req.teacher?._id;
        const requesterRole = req.user ?'User' :'Teacher';

        if (!subject || !category || !message) {
            return res.status(400).json({ success: false, message:'Required fields missing' });
        }

        const attachments = req.files ? req.files.map(f => f.path.replace(/\\/g,'/')) : [];

        const newTicket = new SupportTicket({
            requesterId,
            requesterRole,
            subject,
            category,
            priority: priority ||'Medium',
            messages: [{
                senderId: requesterId,
                senderModel: requesterRole,
                text: message,
                attachments: attachments
            }]
        });

        await newTicket.save();

        // Notify Admin that a new support ticket has been raised
        try {
            const Notification = require('../Models/NotificationModel');
            const requesterName = req.user?.name || req.teacher?.tname || 'A User';
            const roleLabel = req.user ? 'Student' : 'Teacher';
            await Notification.create({
                recipient: 'admin',
                recipientModel: 'Admin',
                sender: requesterId || null,
                senderModel: req.user ? 'User' : 'Teacher',
                senderName: requesterName,
                type: 'general',
                title: `[Support] New Ticket [${newTicket.ticketId}]`,
                message: `${roleLabel} "${requesterName}" raised a new support ticket: "${subject}" (Priority: ${newTicket.priority}, Category: ${category}).`,
                referenceId: newTicket._id
            });
            console.log('Notification triggered: New support ticket created by', roleLabel);
        } catch (notifErr) {
            console.error('Failed to trigger ticket creation notification:', notifErr.message);
        }

        // Emit real-time notification via socket to the recipient
        try {
            const io = req.app.get('io');
            if (io) {
                // Notify admin room about new ticket
                io.emit('new_support_ticket', {
                    ticketId: newTicket._id,
                    ticketRef: newTicket.ticketId,
                    subject: newTicket.subject,
                    from: requesterName,
                    role: roleLabel
                });
            }
        } catch (socketErr) {
            console.error('Socket emit error (new ticket):', socketErr.message);
        }

        res.status(201).json({
            success: true,
            message:'Ticket raised successfully',
            ticket: newTicket
        });
    } catch (error) {
        console.error('Create Ticket Error:', error);
        res.status(500).json({ success: false, message:'Server error' });
    }
};

// Get tickets (Admin sees all, User/Teacher sees their own)
exports.getTickets = async (req, res) => {
    try {
        const { status, priority, category } = req.query;
        let query = {};

        // Role-based filtering
        if (req.user) {
            query.requesterId = req.user._id;
            query.requesterRole ='User';
        } else if (req.teacher) {
            query.requesterId = req.teacher._id;
            query.requesterRole ='Teacher';
        } else if (!req.adminId) {
             return res.status(403).json({ success: false, message:'Unauthorized' });
        }

        // Apply filters
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (category) query.category = category;

        const tickets = await SupportTicket.find(query)
            .sort({ lastMessageAt: -1 })
            .populate('requesterId','tname temail name email avatar tprofile')
            .populate('assignedAdminId','A_name A_email')
            .populate('messages.senderId','name tname avatar A_name');

        res.status(200).json({ success: true, tickets });
    } catch (error) {
        console.error('Get Tickets Error:', error);
        res.status(500).json({ success: false, message:'Server error' });
    }
};

// Get single ticket details
exports.getTicketById = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id)
            .populate('requesterId','tname temail name email avatar tprofile')
            .populate('assignedAdminId','A_name A_email')
            .populate('messages.senderId','name tname avatar A_name');

        if (!ticket) {
            return res.status(404).json({ success: false, message:'Ticket not found' });
        }

        // Check ownership
        const requesterId = req.user?._id || req.teacher?._id;
        if (!req.adminId && ticket.requesterId._id.toString() !== requesterId?.toString()) {
            return res.status(403).json({ success: false, message:'Access denied' });
        }

        res.status(200).json({ success: true, ticket });
    } catch (error) {
        console.error('Get Ticket Error:', error);
        res.status(500).json({ success: false, message:'Server error' });
    }
};

// Add a message to ticket
exports.addMessage = async (req, res) => {
    try {
        const { text, attachments } = req.body;
        const senderId = req.user?._id || req.teacher?._id || req.adminId;
        const senderModel = req.user ?'User' : req.teacher ?'Teacher' :'admins';

        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message:'Ticket not found' });
        }

        const newAttachments = req.files ? req.files.map(f => f.path.replace(/\\/g,'/')) : [];

        ticket.messages.push({
            senderId,
            senderModel,
            text,
            attachments: newAttachments
        });
        ticket.lastMessageAt = Date.now();
        
        // Auto-reopen if closed? Maybe not.
        if (ticket.status ==='Closed') {
            ticket.status ='In Progress';
        }

        await ticket.save();

        // Send notification on new message
        try {
            const Notification = require('../Models/NotificationModel');
            const isAdminReplying = !!req.adminId;

            if (isAdminReplying) {
                // Admin replied  notify the requester (Teacher or Student)
                const recipientId = ticket.requesterId.toString();
                const isTeacher = ticket.requesterRole ==='Teacher';
                const ticketOwnerLabel = isTeacher ?'Teacher' :'Student';
                await Notification.create({
                    recipient: recipientId,
                    recipientModel: isTeacher ?'Teacher' :'User',
                    sender: null,
                    senderModel:'Admin',
                    senderName:'Support Team',
                    type:'general',
                    title: `Support Reply  [${ticket.ticketId}]`,
                    message: `Admin has replied to your support ticket"${ticket.subject}". Login to view the response.`,
                    referenceId: ticket._id
                });
                console.log('Notification triggered: Admin replied to ticket for', ticketOwnerLabel);
            } else {
                // Teacher or Student sent a message  notify Admin
                const senderName = req.user?.name || req.teacher?.tname ||'A User';
                const roleLabel = req.user ?'Student' :'Teacher';
                await Notification.create({
                    recipient:'admin',
                    recipientModel:'Admin',
                    sender: senderId || null,
                    senderModel: req.user ?'User' :'Teacher',
                    senderName: senderName,
                    type:'general',
                    title: `New Reply on Ticket  [${ticket.ticketId}]`,
                    message: `${roleLabel}"${senderName}" sent a new message on ticket"${ticket.subject}".`,
                    referenceId: ticket._id
                });
                console.log('Notification triggered:', roleLabel,'replied on ticket');
            }
        } catch (notifErr) {
            console.error('Failed to trigger ticket reply notification:', notifErr.message);
        }

        // Emit real-time notification via socket to the recipient
        try {
            const io = req.app.get('io');
            if (io) {
                const notifPayload = {
                    ticketId: ticket._id.toString(),
                    ticketRef: ticket.ticketId,
                    subject: ticket.subject,
                    senderName: isAdminReplying ? 'Support Team' : (req.user?.name || req.teacher?.tname || 'User'),
                    isAdmin: isAdminReplying
                };
                // Emit to the ticket room so both parties get it instantly
                io.to(ticket._id.toString()).emit('ticket_notification', notifPayload);
                // Also emit a personal notification to the recipient
                const recipientId = isAdminReplying
                    ? ticket.requesterId.toString()
                    : 'admin';
                io.emit(`notification_${recipientId}`, notifPayload);
            }
        } catch (socketErr) {
            console.error('Socket emit error (new message):', socketErr.message);
        }

        res.status(200).json({ success: true, message: 'Message sent', ticket });
    } catch (error) {
        console.error('Add Message Error:', error);
        res.status(500).json({ success: false, message:'Server error' });
    }
};

// Update ticket status (Admin only)
exports.updateTicketStatus = async (req, res) => {
    try {
        const { status, priority, assignedAdminId } = req.body;
        
        const update = {};
        if (status) update.status = status;
        if (priority) update.priority = priority;
        if (assignedAdminId) update.assignedAdminId = assignedAdminId;

        const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, update, { new: true });

        // Notify the requester (Teacher/Student) about status change
        if (status && ticket) {
            try {
                const Notification = require('../Models/NotificationModel');
                const isTeacher = ticket.requesterRole ==='Teacher';
                let statusEmoji ='';
                if (status ==='Resolved') statusEmoji ='';
                else if (status ==='Closed') statusEmoji ='';
                else if (status ==='In Progress') statusEmoji ='';
                else if (status ==='Open') statusEmoji ='';

                await Notification.create({
                    recipient: ticket.requesterId.toString(),
                    recipientModel: isTeacher ?'Teacher' :'User',
                    sender: null,
                    senderModel:'Admin',
                    senderName:'Support Team',
                    type:'general',
                    title: `Ticket ${statusEmoji} ${status} [${ticket.ticketId}]`,
                    message: `Your support ticket"${ticket.subject}" has been marked as ${status} by the Admin.`,
                    referenceId: ticket._id
                });
                console.log('Notification triggered: Ticket status updated to', status);
            } catch (notifErr) {
                console.error('Failed to trigger ticket status notification:', notifErr.message);
            }
        }

        res.status(200).json({ success: true, message:'Ticket updated', ticket });
    } catch (error) {
        console.error('Update Ticket Error:', error);
        res.status(500).json({ success: false, message:'Server error' });
    }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const myId = req.user?._id || req.teacher?._id || req.adminId;

        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ success: false, message:'Ticket not found' });
        }

        let updated = false;
        ticket.messages.forEach(msg => {
            if (msg.senderId.toString() !== myId.toString() && !msg.isRead) {
                msg.isRead = true;
                msg.readAt = Date.now();
                updated = true;
            }
        });

        if (updated) {
            await ticket.save();
        }

        // Mark associated notifications as read as well for this specific recipient
        try {
            const Notification = require('../Models/NotificationModel');
            let recipientFilter = '';
            if (req.adminId) {
                recipientFilter = 'admin';
            } else if (req.teacher?._id) {
                recipientFilter = req.teacher._id.toString();
            } else if (req.user?._id) {
                recipientFilter = req.user._id.toString();
            }

            if (recipientFilter) {
                await Notification.updateMany(
                    { referenceId: ticketId, recipient: recipientFilter, isRead: false },
                    { isRead: true }
                );
            }
        } catch (notifErr) {
            console.error('Failed to mark associated notifications as read:', notifErr.message);
        }

        res.status(200).json({ success: true, ticket });
    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ success: false, message:'Server error' });
    }
};

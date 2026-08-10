// Controllers/ContactController.js
const Contact = require('../Models/contactusModels');
const { sendContactMail } = require("../utils/contact.mailer");
// Submit contact form
const submitContact = async (req, res) => {
    try {
        console.log(' Received contact submission:', req.body);
        const { name, email, subject, phone, message } = req.body;

        // 1 Validation
        if (!name || !email || !subject || !phone || !message) {
            return res.status(400).json({
                success: false,
                message:'All fields are required',
            });
        }

        // 2 Spam protection (5 min)
        const recentSubmission = await Contact.findOne({
            email: email.toLowerCase(),
            createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
        });

        if (recentSubmission) {
            return res.status(429).json({
                success: false,
                message:'Please wait 5 minutes before submitting another message',
                waitTime: 300,
            });
        }

        // 3 Client info
        const ipAddress =
            req.ip ||
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress;

        const userAgent = req.headers['user-agent'];

        // 4 Save to DB
        const contact = await Contact.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            subject: subject.trim(),
            phone: phone.trim(),
            message: message.trim(),
            ipAddress,
            userAgent,
        });

        const referenceId = `MSG-${contact._id.toString().slice(-6).toUpperCase()}`;

        console.log(' Contact saved:', referenceId);

        // 5 SEND EMAIL (ADMIN) - Async to avoid blocking response
        setImmediate(async () => {
            try {
                const { targetEmail } = req.body;
                const recipient = targetEmail ||"admin@draa.in";
                console.log(' Attempting to send contact email in background to:', recipient);
                
                await sendContactMail({
                    name: contact.name,
                    email: contact.email,
                    phone: contact.phone,
                    subject: contact.subject,
                    message: contact.message,
                    reference: referenceId,
                    to: recipient
                });
                console.log(' Background contact email sent successfully to:', recipient);
            } catch (emailError) {
                console.error(' Background email failed:', emailError.message);
            }
        });

        // 6 Response to frontend
        return res.status(201).json({
            success: true,
            message:
'Thank you! Your message has been sent successfully. We will get back to you within 2448 hours.',
            data: {
                id: contact._id,
                submittedAt: contact.createdAt,
                status: contact.status,
                reference: referenceId,
            },
        });

    } catch (error) {
        console.error(' Contact submission error:', error);
        return res.status(500).json({
            success: false,
            message:'Something went wrong. Please try again later.',
        });
    }
};

// Get all contacts (admin only)
const getAllContacts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const priority = req.query.priority;
        const search = req.query.search;

        const query = {};
        if (status) query.status = status;
        if (priority) query.priority = priority;

        // Add search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options:'i' } },
                { email: { $regex: search, $options:'i' } },
                { subject: { $regex: search, $options:'i' } },
                { message: { $regex: search, $options:'i' } }
            ];
        }

        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Contact.countDocuments(query);

        // Get statistics
        const stats = await Contact.aggregate([
            {
                $group: {
                    _id:'$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusCounts = {};
        stats.forEach(stat => {
            statusCounts[stat._id] = stat.count;
        });

        res.status(200).json({
            success: true,
            message:'Contacts retrieved successfully',
            data: {
                contacts,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total,
                    limit
                },
                statistics: {
                    total,
                    new: statusCounts.new || 0,
                    read: statusCounts.read || 0,
                    replied: statusCounts.replied || 0,
                    resolved: statusCounts.resolved || 0
                }
            }
        });
    } catch (error) {
        console.error(' Get contacts error:', error);
        res.status(500).json({
            success: false,
            message:'Failed to retrieve contacts'
        });
    }
};

// Get single contact by ID
const getContactById = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message:'Contact not found'
            });
        }

        // Mark as read if it's new
        if (contact.status ==='new') {
            contact.status ='read';
            contact.updatedAt = new Date();
            await contact.save();
        }

        res.status(200).json({
            success: true,
            message:'Contact retrieved successfully',
            data: contact
        });
    } catch (error) {
        console.error(' Get contact by ID error:', error);
        res.status(500).json({
            success: false,
            message:'Failed to retrieve contact'
        });
    }
};

// Update contact status
const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, priority } = req.body;

        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message:'Contact not found'
            });
        }

        if (status) contact.status = status;
        if (priority) contact.priority = priority;
        contact.updatedAt = new Date();

        const updatedContact = await contact.save();

        console.log(` Contact status updated: ${id} -> ${status || contact.status}`);

        res.status(200).json({
            success: true,
            message:'Contact updated successfully',
            data: updatedContact
        });
    } catch (error) {
        console.error(' Update contact error:', error);
        res.status(500).json({
            success: false,
            message:'Failed to update contact'
        });
    }
};

// Delete contact
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message:'Contact not found'
            });
        }

        console.log(` Contact deleted: ${id} - ${contact.name} (${contact.email})`);

        res.status(200).json({
            success: true,
            message:'Contact deleted successfully'
        });
    } catch (error) {
        console.error(' Delete contact error:', error);
        res.status(500).json({
            success: false,
            message:'Failed to delete contact'
        });
    }
};

// Get contact statistics
const getContactStats = async (req, res) => {
    try {
        const totalContacts = await Contact.countDocuments();

        const statusStats = await Contact.aggregate([
            {
                $group: {
                    _id:'$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const monthlyStats = await Contact.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year:'$createdAt' },
                        month: { $month:'$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: {'_id.year': -1,'_id.month': -1 } },
            { $limit: 6 }
        ]);

        const recentContacts = await Contact.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email subject status createdAt');

        res.status(200).json({
            success: true,
            message:'Statistics retrieved successfully',
            data: {
                total: totalContacts,
                statusBreakdown: statusStats,
                monthlyTrend: monthlyStats,
                recentContacts
            }
        });
    } catch (error) {
        console.error(' Get stats error:', error);
        res.status(500).json({
            success: false,
            message:'Failed to retrieve statistics'
        });
    }
};

module.exports = {
    submitContact,
    getAllContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
    getContactStats
};

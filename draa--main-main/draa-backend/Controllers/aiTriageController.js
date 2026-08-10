const SupportTicket = require('../Models/SupportTicketModel');
const routingEngine = require('./routingEngine');

// Static mock FAQs database for self-service matching
const MOCK_FAQ_BASE = [
    {
        keywords: ['login', 'password', 'signin', 'sign in', 'reset'],
        answer: "To reset your password, visit the login page and click 'Forgot Password'. You'll receive an OTP or link on your registered email/phone to set a new password.",
        category: 'Technical'
    },
    {
        keywords: ['refund', 'cancel', 'money back', 'billing', 'charge', 'invoice'],
        answer: "Refunds are processed within 5-7 business days if requested within 48 hours of course purchase. Send us your purchase invoice to billing@draa.com.",
        category: 'Billing'
    },
    {
        keywords: ['exam', 'test', 'series', 'quiz', 'question'],
        answer: "If you face disruptions during an exam attempt, ensure you have a stable connection. You can resume most tests within 10 minutes of interruption from the dashboard.",
        category: 'Exam Issue'
    },
    {
        keywords: ['video', 'buffering', 'play', 'load', 'slow'],
        answer: "Try clearing browser cache, checking internet speed (minimum 2Mbps needed), or switching the video quality settings in the player controls.",
        category: 'Technical'
    }
];

exports.processL1Message = async (ticket, messageText, requesterName) => {
    try {
        const textLower = messageText.toLowerCase();

        // 1. Check for manual escalation trigger
        if (textLower.match(/\b(agent|human|representative|support team|escalate|help|l2)\b/)) {
            return await triggerEscalation(ticket);
        }

        // 2. Classify intent & match FAQs
        let matchedAnswer = null;
        let matchedCategory = 'Other';

        for (const faq of MOCK_FAQ_BASE) {
            const hasKeyword = faq.keywords.some(kw => textLower.includes(kw));
            if (hasKeyword) {
                matchedAnswer = faq.answer;
                matchedCategory = faq.category;
                break;
            }
        }

        // 3. Update category on the ticket if classified
        if (matchedCategory !== 'Other' && ticket.category === 'Other') {
            ticket.category = matchedCategory;
        }

        // 4. Track L1 conversation limit to prevent loop
        const botMessages = ticket.messages.filter(msg => msg.senderId.toString() === ticket._id.toString());
        if (botMessages.length >= 2 && !matchedAnswer) {
            // Escalate if bot cannot answer after 2 turns
            return await triggerEscalation(ticket);
        }

        if (matchedAnswer) {
            return `Hello ${requesterName}, here is what I found regarding your issue:\n\n${matchedAnswer}\n\n(If you still need human assistance, reply with 'agent').`;
        }

        // Default bot response
        return `Hello ${requesterName}, I am the Draa automated L1 assistant. Can you describe your query? You can ask about payments, login issues, exams, or video playing issues. If you need a human agent, reply with 'agent'.`;

    } catch (err) {
        console.error('Error processing L1 message:', err);
        return "I'm experiencing technical difficulties matching your query. An agent will be notified.";
    }
};

const triggerEscalation = async (ticket) => {
    ticket.currentTier = 'L2';
    ticket.status = 'Open';
    
    // Attempt auto-routing to an active L2 agent
    try {
        const assignedAgent = await routingEngine.routeTicketToAgent(ticket);
        if (assignedAgent) {
            ticket.assignedAgentId = assignedAgent.adminId;
            ticket.status = 'In Progress';
        }
    } catch (routingErr) {
        console.error('L1 Auto-routing escalation failed, ticket remains in general L2 queue:', routingErr.message);
    }

    await ticket.save();
    
    return "I am transferring this ticket to our L2 Human Support desk. A support agent has been notified and will reply shortly.";
};

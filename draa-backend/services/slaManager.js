const SupportTicket = require('../Models/SupportTicketModel');
const routingEngine = require('../Controllers/routingEngine');

// Resolution SLA duration in milliseconds based on priority
const SLA_DURATIONS = {
    'Urgent': 2 * 60 * 60 * 1000,      // 2 hours
    'High': 6 * 60 * 60 * 1000,        // 6 hours
    'Medium': 24 * 60 * 60 * 1000,     // 24 hours
    'Low': 48 * 60 * 60 * 1000         // 48 hours
};

// Set dynamic SLA due date on ticket creation or escalation
exports.calculateSLADueDate = (priority = 'Medium') => {
    const duration = SLA_DURATIONS[priority] || SLA_DURATIONS['Medium'];
    return new Date(Date.now() + duration);
};

// Cron-like periodic scanner to detect SLA violations
exports.checkSLAStatus = async () => {
    try {
        const now = new Date();

        // Query open/in-progress tickets that have breached their SLA deadline
        const breachedTickets = await SupportTicket.find({
            status: { $in: ['Open', 'In Progress'] },
            slaDueDate: { $lt: now },
            slaBreached: { $ne: true }
        });

        if (breachedTickets.length === 0) {
            return;
        }

        console.log(`[SLA Manager] Found ${breachedTickets.length} breached tickets. Initiating escalation...`);

        for (const ticket of breachedTickets) {
            ticket.slaBreached = true;
            
            // Log previous tier before escalation
            const previousTier = ticket.currentTier;

            // Escalate tiers
            if (ticket.currentTier === 'L1') {
                ticket.currentTier = 'L2';
                ticket.status = 'Open';
                // Reset SLA due date for L2 queue handling
                ticket.slaDueDate = exports.calculateSLADueDate(ticket.priority);
                ticket.slaBreached = false;

                ticket.messages.push({
                    senderId: ticket._id,
                    senderModel: 'User', // general bot/system marker
                    text: `[SYSTEM] First Response SLA breached. Auto-escalating ticket from L1 to L2 support team.`,
                    timestamp: new Date()
                });
                
                // Re-route to online L2 human agents
                const newAgent = await routingEngine.routeTicketToAgent(ticket);
                if (newAgent) {
                    ticket.assignedAgentId = newAgent.adminId;
                    ticket.status = 'In Progress';
                }
            } else if (ticket.currentTier === 'L2') {
                ticket.currentTier = 'L3';
                ticket.status = 'Open';
                ticket.slaDueDate = exports.calculateSLADueDate('Urgent'); // Urgent SLA for Engineering
                ticket.slaBreached = false;

                ticket.messages.push({
                    senderId: ticket._id,
                    senderModel: 'User',
                    text: `[SYSTEM ALERT] L2 Resolution SLA breached. Auto-escalating ticket to L3 Engineering support (Priority: Urgent).`,
                    timestamp: new Date()
                });

                // Release previous agent workload
                if (ticket.assignedAgentId) {
                    await routingEngine.releaseAgentLoad(ticket.assignedAgentId);
                    ticket.assignedAgentId = null;
                }

                // Notify developers via Slack webhook mock or high priority admin alert
                await triggerL3SlackWebhook(ticket);
            }

            await ticket.save();
        }
    } catch (err) {
        console.error('SLA Checker execution error:', err);
    }
};

const triggerL3SlackWebhook = async (ticket) => {
    // In production, integrate your developer workspace Slack/Teams URL:
    // axios.post(process.env.SLACK_DEV_WEBHOOK_URL, { text: `<!here> Critical SLA Breach...` })
    console.log(`[SLACK DEV WEBHOOK] ALERT: Ticket [${ticket.ticketId}] escalated to L3 Engineering due to SLA Breach on L2.`);
};

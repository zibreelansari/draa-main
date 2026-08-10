const SupportAgent = require('../Models/SupportAgentModel');
const SupportTicket = require('../Models/SupportTicketModel');

exports.routeTicketToAgent = async (ticket) => {
    try {
        // Find online agents who are not at maximum capacity
        let onlineAgents = await SupportAgent.find({
            isActive: true,
            $expr: { $lt: ["$currentLoad", "$maxCapacity"] }
        });

        if (onlineAgents.length === 0) {
            console.log(`[Routing Engine] No support agents online. Ticket [${ticket.ticketId}] remains in queue.`);
            return null;
        }

        // Try to filter by skills matches category
        let candidateAgents = onlineAgents.filter(agent => 
            agent.skills.includes(ticket.category)
        );

        // Fallback to all online agents if no specialized skill matches
        if (candidateAgents.length === 0) {
            candidateAgents = onlineAgents;
        }

        // Least-Loaded routing algorithm: pick the agent with the lowest active load
        candidateAgents.sort((a, b) => a.currentLoad - b.currentLoad);
        const selectedAgent = candidateAgents[0];

        // Assign to the agent
        selectedAgent.currentLoad += 1;
        await selectedAgent.save();

        console.log(`[Routing Engine] Assigned Ticket [${ticket.ticketId}] to Agent [${selectedAgent.adminId}] (Load: ${selectedAgent.currentLoad})`);
        
        return selectedAgent;
    } catch (err) {
        console.error('Error during automatic routing:', err);
        return null;
    }
};

// Release ticket load from agent when resolved/closed
exports.releaseAgentLoad = async (agentAdminId) => {
    try {
        const agent = await SupportAgent.findOne({ adminId: agentAdminId });
        if (agent && agent.currentLoad > 0) {
            agent.currentLoad -= 1;
            await agent.save();
            console.log(`[Routing Engine] Released load for Agent [${agentAdminId}]. New Load: ${agent.currentLoad}`);
        }
    } catch (err) {
        console.error('Failed to release agent load:', err);
    }
};

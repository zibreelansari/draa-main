export type SupportRole ='User' |'Teacher' |'Admin';
export type TicketStatus ='Open' |'In Progress' |'Resolved' |'Closed';
export type TicketPriority ='Low' |'Medium' |'High' |'Urgent';
export type TicketCategory ='Technical' |'Billing' |'Course Content' |'Exam Issue' |'Other';

export interface SupportMessage {
    _id: string;
    senderId: string | any;
    senderModel: SupportRole;
    text: string;
    attachments: string[];
    timestamp: string;
    isRead?: boolean;
    readAt?: string;
}

export interface SupportTicket {
    _id: string;
    ticketId: string;
    requesterId: {
        _id: string;
        name?: string;
        tname?: string;
        email?: string;
        temail?: string;
        avatar?: string;
        tprofile?: string;
    } | any;
    requesterRole:'User' |'Teacher';
    subject: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    assignedAdminId?: {
        _id: string;
        A_name: string;
        A_email: string;
    };
    messages: SupportMessage[];
    lastMessageAt: string;
    createdAt: string;
    updatedAt: string;
}

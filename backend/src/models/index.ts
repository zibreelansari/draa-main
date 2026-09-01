// ── @draa/database Models ───────────────────────────────────────────────────
// Barrel export for all Mongoose models.
// ─────────────────────────────────────────────────────────────────────────────

export { User, type IUser } from './User.model';
export { StudentProfile, type IStudentProfile } from './StudentProfile.model';
export { InstituteProfile, type IInstituteProfile } from './InstituteProfile.model';
export { Institute, type IInstitute } from './Institute.model';
export { Course, type ICourse } from './Course.model';
export { Application, type IApplication } from './Application.model';
export { ApplicationMessage, type IApplicationMessage } from './ApplicationMessage.model';
export { OrientationModule, StudentOrientationProgress, type IOrientationModule, type IStudentOrientationProgress } from './OrientationModule.model';
export { Session, type ISession } from './Session.model';
export { SavedCourse, type ISavedCourse } from './SavedCourse.model';
export { StudentDocument, type IStudentDocument } from './StudentDocument.model';
export { Notification, type INotification } from './Notification.model';
export { SupportTicket, type ISupportTicket } from './SupportTicket.model';
export { AuditLog, type IAuditLog } from './AuditLog.model';
export { ContactInquiry, type IContactInquiry } from './ContactInquiry.model';
export { NewsletterSub, type INewsletterSub } from './NewsletterSub.model';

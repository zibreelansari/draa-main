import { User, StudentProfile, InstituteProfile, Institute, Course, Application, StudentDocument, Notification, SupportTicket } from '../models/index';
import { hashPassword } from '../utils/security';

const demoUsers = [
  {
    email: 'student@demo.draa.in',
    password: 'student1234',
    role: 'STUDENT' as const,
    displayName: 'Amina Al-Mansoor',
    profile: {
      firstName: 'Amina',
      lastName: 'Al-Mansoor',
      country: 'United Arab Emirates',
      passportNumber: 'N98765432',
      dateOfBirth: '2002-04-18',
    },
  },
  {
    email: 'institute@demo.draa.in',
    password: 'institute1234',
    role: 'INSTITUTE' as const,
    displayName: 'DRAA Institute of Technology',
    profile: {
      instituteName: 'DRAA Institute of Technology',
      contactName: 'Dr. Rajesh Sharma',
      city: 'New Delhi',
      website: 'https://dit.draa.in',
      approvalStatus: 'APPROVED' as const,
    },
  },
  {
    email: 'admin@demo.draa.in',
    password: 'admin12345',
    role: 'ADMIN' as const,
    displayName: 'DRAA Central Operations Admin',
  },
];

export async function seedDemoUsers(): Promise<void> {
  for (const demo of demoUsers) {
    let user = await User.findOne({ email: demo.email, role: demo.role });

    const passwordHash = hashPassword(demo.password);

    if (user) {
      // Update password hash to match current hashing scheme
      user.passwordHash = passwordHash;
      user.status = 'ACTIVE';
      user.displayName = demo.displayName;
      await user.save();
    } else {
      user = await User.create({
        email: demo.email,
        passwordHash,
        role: demo.role,
        status: 'ACTIVE',
        displayName: demo.displayName,
      });
    }

    if (demo.role === 'STUDENT' && demo.profile) {
      await StudentProfile.findOneAndUpdate(
        { userId: user._id },
        {
          $set: {
            userId: user._id,
            firstName: demo.profile.firstName,
            lastName: demo.profile.lastName,
            country: demo.profile.country,
            passportNumber: demo.profile.passportNumber,
            dateOfBirth: demo.profile.dateOfBirth,
          },
        },
        { upsert: true }
      );

      // Seed student documents
      const docs = [
        { type: 'Passport', name: 'amina_passport_scan.pdf', status: 'VERIFIED' as const },
        { type: 'Academic Transcripts', name: 'high_school_grades_attested.pdf', status: 'VERIFIED' as const },
        { type: 'English Proficiency Certificate', name: 'ielts_academic_band_7.5.pdf', status: 'VERIFIED' as const },
        { type: 'Statement of Purpose', name: 'statement_of_purpose_cs.pdf', status: 'UPLOADED' as const },
        { type: 'Passport-size Photograph', name: 'passport_photo.jpg', status: 'VERIFIED' as const },
      ];

      for (const d of docs) {
        await StudentDocument.findOneAndUpdate(
          { studentUserId: user._id, documentType: d.type },
          { $set: { fileName: d.name, status: d.status } },
          { upsert: true }
        );
      }

      // Seed sample applications
      const sampleCourse = await Course.findOne({ slug: 'bachelor-computer-science' });
      if (sampleCourse) {
        await Application.findOneAndUpdate(
          { studentUserId: user._id, courseId: sampleCourse._id },
          {
            $setOnInsert: {
              studentUserId: user._id,
              courseId: sampleCourse._id,
              statement: 'I am passionate about Computer Science and software engineering. I have maintained a 3.9 GPA in mathematics and programming.',
              status: 'OFFERED',
              decisionNote: 'Congratulations! Your conditional offer letter has been issued. Please review tuition and visa documentation milestones.',
              submittedAt: new Date(Date.now() - 7 * 86400000),
            },
          },
          { upsert: true }
        );
      }

      const sampleCourse2 = await Course.findOne({ slug: 'btech-artificial-intelligence' });
      if (sampleCourse2) {
        await Application.findOneAndUpdate(
          { studentUserId: user._id, courseId: sampleCourse2._id },
          {
            $setOnInsert: {
              studentUserId: user._id,
              courseId: sampleCourse2._id,
              statement: 'Applying for AI & ML track to pursue research in natural language processing and computer vision.',
              status: 'UNDER_REVIEW',
              decisionNote: 'Your academic records are currently being evaluated by the Department of Computing Admissions Committee.',
              submittedAt: new Date(Date.now() - 3 * 86400000),
            },
          },
          { upsert: true }
        );
      }

      // Seed student notifications
      await Notification.findOneAndUpdate(
        { userId: user._id, title: 'Offer Letter Issued' },
        {
          $setOnInsert: {
            userId: user._id,
            title: 'Offer Letter Issued',
            body: 'DRAA Institute of Technology has issued an offer for Bachelor of Computer Science. Review requirements in your dashboard.',
            kind: 'SUCCESS',
            isRead: false,
          },
        },
        { upsert: true }
      );
    }

    if (demo.role === 'INSTITUTE' && demo.profile) {
      await InstituteProfile.findOneAndUpdate(
        { userId: user._id },
        {
          $set: {
            userId: user._id,
            instituteName: demo.profile.instituteName,
            contactName: demo.profile.contactName,
            city: demo.profile.city,
            website: demo.profile.website,
            approvalStatus: demo.profile.approvalStatus,
          },
        },
        { upsert: true }
      );

      // Link institute to owner
      await Institute.findOneAndUpdate(
        { slug: 'draa-institute-technology' },
        { $set: { ownerUserId: user._id, status: 'PUBLISHED' } }
      );
    }

    console.log(`[Seed] Synced demo user: ${demo.email} (${demo.role})`);
  }
}

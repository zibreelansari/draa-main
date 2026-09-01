import {
  User,
  StudentProfile,
  InstituteProfile,
  Institute,
  Course,
  Application,
  StudentDocument,
  Notification,
  SupportTicket,
} from '../models/index';
import { hashPassword } from '../utils/security';

const demoUsers = [
  // Primary Student Account
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
      phone: '+971 50 1234567',
    },
  },
  // Nepal Scholar
  {
    email: 'student.nepal@demo.draa.in',
    password: 'student1234',
    role: 'STUDENT' as const,
    displayName: 'Aarav Shrestha',
    profile: {
      firstName: 'Aarav',
      lastName: 'Shrestha',
      country: 'Nepal',
      passportNumber: 'NP12345678',
      dateOfBirth: '2001-11-22',
      phone: '+977 9801234567',
    },
  },
  // Nigeria Scholar
  {
    email: 'student.nigeria@demo.draa.in',
    password: 'student1234',
    role: 'STUDENT' as const,
    displayName: 'Chinedu Okafor',
    profile: {
      firstName: 'Chinedu',
      lastName: 'Okafor',
      country: 'Nigeria',
      passportNumber: 'A87654321',
      dateOfBirth: '2000-08-14',
      phone: '+234 80 1234 5678',
    },
  },
  // Bangladesh Scholar
  {
    email: 'student.bangladesh@demo.draa.in',
    password: 'student1234',
    role: 'STUDENT' as const,
    displayName: 'Tasnim Rahman',
    profile: {
      firstName: 'Tasnim',
      lastName: 'Rahman',
      country: 'Bangladesh',
      passportNumber: 'BD55443322',
      dateOfBirth: '2003-01-09',
      phone: '+880 17 1234 5678',
    },
  },
  // USA Scholar
  {
    email: 'student.usa@demo.draa.in',
    password: 'student1234',
    role: 'STUDENT' as const,
    displayName: 'Emily Clark',
    profile: {
      firstName: 'Emily',
      lastName: 'Clark',
      country: 'United States',
      passportNumber: 'US99887766',
      dateOfBirth: '1999-06-30',
      phone: '+1 415 555 2671',
    },
  },

  // Primary Institute Account
  {
    email: 'institute@demo.draa.in',
    password: 'institute1234',
    role: 'INSTITUTE' as const,
    displayName: 'DRAA Institute of Technology & AI',
    profile: {
      instituteName: 'DRAA Institute of Technology & AI',
      contactName: 'Dr. Rajesh Sharma (Dean of Admissions)',
      city: 'Bengaluru',
      website: 'https://dit.draa.in',
      approvalStatus: 'APPROVED' as const,
    },
  },
  // Business School Institute Account
  {
    email: 'admissions.management@demo.draa.in',
    password: 'institute1234',
    role: 'INSTITUTE' as const,
    displayName: 'DRAA School of Global Management',
    profile: {
      instituteName: 'DRAA School of Global Management',
      contactName: 'Prof. Meenakshi Iyer (Director of Admissions)',
      city: 'New Delhi',
      website: 'https://dsm.draa.in',
      approvalStatus: 'APPROVED' as const,
    },
  },

  // Central Administrator Account
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
            phone: demo.profile.phone,
          },
        },
        { upsert: true }
      );

      // Seed student documents
      const docs = [
        { type: 'Passport', name: `${demo.profile.firstName.toLowerCase()}_passport_scan.pdf`, status: 'VERIFIED' as const },
        { type: 'Academic Transcripts', name: 'high_school_grades_attested.pdf', status: 'VERIFIED' as const },
        { type: 'English Proficiency Certificate', name: 'ielts_academic_score_card.pdf', status: 'VERIFIED' as const },
        { type: 'Statement of Purpose', name: 'statement_of_purpose.pdf', status: 'UPLOADED' as const },
        { type: 'Passport-size Photograph', name: 'official_photo.jpg', status: 'VERIFIED' as const },
      ];

      for (const d of docs) {
        await StudentDocument.findOneAndUpdate(
          { studentUserId: user._id, documentType: d.type },
          { $set: { fileName: d.name, status: d.status } },
          { upsert: true }
        );
      }

      // Seed diverse applications
      const csCourse = await Course.findOne({ slug: 'bachelor-computer-science' });
      if (csCourse) {
        await Application.findOneAndUpdate(
          { studentUserId: user._id, courseId: csCourse._id },
          {
            $set: {
              studentUserId: user._id,
              courseId: csCourse._id,
              statement: `I am ${demo.profile.firstName} from ${demo.profile.country}, passionate about Software Engineering and Artificial Intelligence. I have maintained strong academic standing in mathematics.`,
              status: demo.email === 'student@demo.draa.in' ? 'OFFERED' : 'UNDER_REVIEW',
              decisionNote: demo.email === 'student@demo.draa.in'
                ? 'Provisional Offer Letter Issued: 50% SII Merit Scholarship Concession Approved for Academic Year 2026-2027.'
                : 'Application under verification by University International Office.',
              submittedAt: new Date(Date.now() - 5 * 86400000),
            },
          },
          { upsert: true }
        );
      }

      const aiCourse = await Course.findOne({ slug: 'btech-artificial-intelligence' });
      if (aiCourse && demo.email !== 'student.usa@demo.draa.in') {
        await Application.findOneAndUpdate(
          { studentUserId: user._id, courseId: aiCourse._id },
          {
            $set: {
              studentUserId: user._id,
              courseId: aiCourse._id,
              statement: 'Applying to pursue specialized research in machine learning models and intelligent robotics.',
              status: 'UNDER_REVIEW',
              decisionNote: 'Academic credentials and equivalence certificate undergoing verification.',
              submittedAt: new Date(Date.now() - 2 * 86400000),
            },
          },
          { upsert: true }
        );
      }

      const mbaCourse = await Course.findOne({ slug: 'master-business-administration' });
      if (mbaCourse && (demo.email === 'student.nigeria@demo.draa.in' || demo.email === 'student.nepal@demo.draa.in')) {
        await Application.findOneAndUpdate(
          { studentUserId: user._id, courseId: mbaCourse._id },
          {
            $set: {
              studentUserId: user._id,
              courseId: mbaCourse._id,
              statement: 'Seeking admission to the Global MBA programme to advance career in international trade and technology venture financing.',
              status: 'OFFERED',
              decisionNote: 'Provisional Admission Confirmed with 25% Institutional Tuition Waiver.',
              submittedAt: new Date(Date.now() - 8 * 86400000),
            },
          },
          { upsert: true }
        );
      }

      // Seed notifications
      await Notification.findOneAndUpdate(
        { userId: user._id, title: 'Admissions Gateway Notification' },
        {
          $set: {
            userId: user._id,
            title: 'Admissions Gateway Notification',
            body: `Welcome ${demo.profile.firstName}! Your international application dossier is active on the Study in India portal.`,
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
      if (demo.email === 'institute@demo.draa.in') {
        await Institute.findOneAndUpdate(
          { slug: 'draa-institute-technology' },
          { $set: { ownerUserId: user._id, status: 'PUBLISHED' } }
        );
      } else if (demo.email === 'admissions.management@demo.draa.in') {
        await Institute.findOneAndUpdate(
          { slug: 'draa-school-management' },
          { $set: { ownerUserId: user._id, status: 'PUBLISHED' } }
        );
      }
    }

    console.log(`[Seed] Synced demo user: ${demo.email} (${demo.role})`);
  }
}

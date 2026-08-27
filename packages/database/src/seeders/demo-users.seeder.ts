import { User, StudentProfile, InstituteProfile } from '../models/index';
import { createHash, randomBytes } from 'node:crypto';

// Simple password hash for demo purposes (production should use bcrypt/argon2)
function demoHash(password: string): string {
  return createHash('sha256').update(password + 'draa-demo-salt').digest('hex');
}

const demoUsers = [
  {
    email: 'student@demo.draa.in',
    password: 'student1234',
    role: 'STUDENT' as const,
    displayName: 'Demo Student',
    profile: {
      firstName: 'Demo',
      lastName: 'Student',
      country: 'United States',
    },
  },
  {
    email: 'institute@demo.draa.in',
    password: 'institute1234',
    role: 'INSTITUTE' as const,
    displayName: 'Demo Institute',
    profile: {
      instituteName: 'DRAA Demo Institute',
      contactName: 'Demo Admin',
      city: 'New Delhi',
      website: 'https://demo.draa.in',
      approvalStatus: 'APPROVED' as const,
    },
  },
  {
    email: 'admin@demo.draa.in',
    password: 'admin12345',
    role: 'ADMIN' as const,
    displayName: 'Demo Admin',
  },
];

export async function seedDemoUsers(): Promise<void> {
  for (const demo of demoUsers) {
    const existing = await User.findOne({ email: demo.email, role: demo.role });
    if (existing) continue;

    const user = await User.create({
      email: demo.email,
      passwordHash: demoHash(demo.password),
      role: demo.role,
      status: 'ACTIVE',
      displayName: demo.displayName,
    });

    if (demo.role === 'STUDENT' && demo.profile && 'firstName' in demo.profile) {
      await StudentProfile.create({
        userId: user._id,
        firstName: demo.profile.firstName,
        lastName: demo.profile.lastName,
        country: demo.profile.country,
      });
    }

    if (demo.role === 'INSTITUTE' && demo.profile && 'instituteName' in demo.profile) {
      await InstituteProfile.create({
        userId: user._id,
        instituteName: demo.profile.instituteName,
        contactName: demo.profile.contactName,
        city: demo.profile.city,
        website: demo.profile.website,
        approvalStatus: demo.profile.approvalStatus,
      });
    }

    console.log(`[Seed] Created demo user: ${demo.email} (${demo.role})`);
  }
}

import mongoose from 'mongoose';

// ── MongoDB Connection with Retry & Index Creation ──────────────────────────

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/draa';
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

let isConnected = false;

/**
 * Create compound indexes for high-volume query paths.
 * Designed for 2K–5K concurrent students/institutes.
 */
async function ensureIndexes(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) return;

  try {
    // Drop any legacy conflicting indexes safely
    try {
      await db.collection('courses').dropIndex('seo.slug_1');
    } catch (_) { /* ignore if not exists */ }

    try {
      await db.collection('sessions').dropIndex('expiresAt_1');
    } catch (_) { /* ignore if not exists */ }

    // User indexes
    const users = db.collection('users');
    await users.createIndex({ email: 1, role: 1 }, { unique: true, background: true });
    await users.createIndex({ role: 1, status: 1, createdAt: -1 }, { background: true });

    // Session indexes
    const sessions = db.collection('sessions');
    await sessions.createIndex({ tokenHash: 1 }, { unique: true, background: true });
    await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true });

    // Application indexes
    const applications = db.collection('applications');
    await applications.createIndex({ studentUserId: 1, status: 1 }, { background: true });
    await applications.createIndex({ courseId: 1, status: 1 }, { background: true });
    await applications.createIndex({ status: 1, submittedAt: -1 }, { background: true });

    // Course indexes
    const courses = db.collection('courses');
    await courses.createIndex({ instituteId: 1, status: 1 }, { background: true });
    await courses.createIndex({ status: 1, level: 1, discipline: 1 }, { background: true });
    await courses.createIndex({ slug: 1 }, { unique: true, background: true });

    // Institute indexes
    const institutes = db.collection('institutes');
    await institutes.createIndex({ ownerUserId: 1 }, { background: true });
    await institutes.createIndex({ slug: 1 }, { unique: true, background: true });
    await institutes.createIndex({ status: 1, name: 1 }, { background: true });

    // Saved courses
    const savedCourses = db.collection('saved_courses');
    await savedCourses.createIndex({ studentUserId: 1, courseId: 1 }, { unique: true, background: true });

    // Notifications
    const notifications = db.collection('notifications');
    await notifications.createIndex({ userId: 1, createdAt: -1 }, { background: true });
    await notifications.createIndex({ audienceRole: 1, createdAt: -1 }, { background: true });

    // Support tickets
    const tickets = db.collection('support_tickets');
    await tickets.createIndex({ userId: 1, status: 1 }, { background: true });
    await tickets.createIndex({ status: 1, createdAt: -1 }, { background: true });

    // Student documents
    const studentDocs = db.collection('student_documents');
    await studentDocs.createIndex({ studentUserId: 1, documentType: 1 }, { unique: true, background: true });

    // Student profiles
    const studentProfiles = db.collection('student_profiles');
    await studentProfiles.createIndex({ userId: 1 }, { unique: true, background: true });

    // Institute profiles
    const instituteProfiles = db.collection('institute_profiles');
    await instituteProfiles.createIndex({ userId: 1 }, { unique: true, background: true });
    await instituteProfiles.createIndex({ approvalStatus: 1 }, { background: true });

    // Audit log
    const auditLog = db.collection('audit_logs');
    await auditLog.createIndex({ createdAt: -1 }, { background: true });

    console.log('[DB] All indexes ensured successfully.');
  } catch (err) {
    console.warn('[DB] Index creation warning (non-fatal):', err instanceof Error ? err.message : err);
  }
}

export async function connectDatabase(): Promise<typeof mongoose> {
  if (isConnected) return mongoose;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(MONGO_URI, {
        maxPoolSize: 50,
        minPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        heartbeatFrequencyMS: 10000,
      });

      isConnected = true;
      console.log(`[DB] Connected to MongoDB (${MONGO_URI.replace(/\/\/.*@/, '//<credentials>@')})`);

      // Create indexes in background after connection
      await ensureIndexes();

      mongoose.connection.on('error', (err) => {
        console.error('[DB] MongoDB connection error:', err);
        isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('[DB] MongoDB disconnected. Will attempt auto-reconnect...');
        isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('[DB] MongoDB reconnected successfully.');
        isConnected = true;
      });

      return mongoose;
    } catch (err) {
      console.error(`[DB] Connection attempt ${attempt}/${MAX_RETRIES} failed:`, err instanceof Error ? err.message : err);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }

  throw new Error(`[DB] Failed to connect to MongoDB after ${MAX_RETRIES} attempts.`);
}

export async function disconnectDatabase(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[DB] MongoDB disconnected.');
  }
}

export { mongoose };

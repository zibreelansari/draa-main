import mongoose from 'mongoose';

// ── MongoDB Connection with Retry ───────────────────────────────────────────

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/draa';
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

let isConnected = false;

export async function connectDatabase(): Promise<typeof mongoose> {
  if (isConnected) return mongoose;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      isConnected = true;
      console.log(`[DB] Connected to MongoDB (${MONGO_URI.replace(/\/\/.*@/, '//<credentials>@')})`);

      mongoose.connection.on('error', (err) => {
        console.error('[DB] MongoDB connection error:', err);
        isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('[DB] MongoDB disconnected. Reconnecting...');
        isConnected = false;
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

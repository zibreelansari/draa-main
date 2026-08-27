export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/draa',
  webOrigin: (process.env.WEB_ORIGIN || 'http://localhost:5173,http://localhost:5175').split(','),
  sessionDays: Number(process.env.SESSION_DAYS || 14),
  secureCookie: process.env.NODE_ENV === 'production',
  seedDemo: process.env.SEED_DEMO !== 'false',
};

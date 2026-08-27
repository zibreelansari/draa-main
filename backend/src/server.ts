import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { connectDatabase } from './connection';
import { runAllSeeders } from './seeders/index';
import { config } from './config';
import apiRoutes from './routes/index';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';

const app = express();

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (config.webOrigin.includes(origin) || config.webOrigin.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev mode
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '250kb' }));
app.use(cookieParser());

// Mount all modular API routes under /api
app.use('/api', apiRoutes);

// Fallback handlers
app.use(notFoundHandler);
app.use(errorHandler);

async function bootstrap() {
  try {
    console.log('[API] Initialising DRAA Unified API Server...');
    await connectDatabase();

    if (config.seedDemo) {
      await runAllSeeders();
    }

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`[API] Server is listening on http://127.0.0.1:${config.port}`);
      console.log(`[API] Health check available at http://127.0.0.1:${config.port}/api/health`);
    });
  } catch (err) {
    console.error('[API] Fatal bootstrap error:', err);
    process.exit(1);
  }
}

void bootstrap();

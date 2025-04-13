import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import { errorHandler } from './middleware/errorHandler';
import { defaultRateLimiter } from './middleware/rateLimiter';
import urlScanRoutes from './routes/urlScanRoutes';
import fileScanRoutes from './routes/fileScanRoutes';
import cveRoutes from './routes/cveRoutes';
import healthRoutes from './routes/healthRoutes';
import { setupSocketHandlers } from './socket';

const app = express();
const server = http.createServer(app);

// Set up Socket.IO with CORS and debugging
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 30000,
  maxHttpBufferSize: 1e8, // 100MB
  path: '/socket.io',
  serveClient: false,
  cookie: false,
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
    // whether to skip middlewares upon successful recovery
    skipMiddlewares: true,
  }
});

// Log when Socket.IO server is initialized
console.log('Socket.IO server initialized with configuration:', {
  cors: { origin: process.env.FRONTEND_URL || '*' },
  transports: ['websocket', 'polling'],
  path: '/socket.io'
});

// Make io available globally
export { io };

// Set up socket handlers
setupSocketHandlers(io);

// Middleware
app.use(express.json({ limit: '32mb' }));
app.use(express.urlencoded({ extended: true, limit: '32mb' }));
app.use(cors());
app.use(morgan('dev'));
app.use(defaultRateLimiter);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/scan/url', urlScanRoutes);
app.use('/api/scan/file', fileScanRoutes);
app.use('/api/cve', cveRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'TLAScanner API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      urlScan: '/api/scan/url',
      fileScan: '/api/scan/file',
      cve: '/api/cve'
    }
  });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is running on port ${PORT}`);
});

export default app;

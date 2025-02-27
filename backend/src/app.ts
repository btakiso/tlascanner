import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { defaultRateLimiter } from './middleware/rateLimiter';
import urlScanRoutes from './routes/urlScanRoutes';
import cveRoutes from './routes/cveRoutes';
import healthRoutes from './routes/healthRoutes';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(defaultRateLimiter);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/scan/url', urlScanRoutes);
app.use('/api/cve', cveRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'TLAScanner API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      urlScan: '/api/scan/url',
      cve: '/api/cve'
    }
  });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

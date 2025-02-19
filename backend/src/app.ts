import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import urlScanRoutes from './routes/urlScanRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/scan/url', urlScanRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TLAScanner API is running',
    endpoints: {
      health: '/health',
      urlScan: '/api/scan/url/scan',
      scanResults: '/api/scan/url/scan/results/:scanId'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

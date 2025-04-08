import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// API Keys
export const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
export const VT_API_KEY = VIRUSTOTAL_API_KEY; // Alias for consistency
export const VT_API_URL = 'https://www.virustotal.com/api/v3';

// Database Configuration
export const DATABASE_CONFIG = {
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'tlascanner',
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT || '5432'),
};

// Server Configuration
export const SERVER_CONFIG = {
  port: parseInt(process.env.PORT || '3000'),
  env: process.env.NODE_ENV || 'development',
};

// Validate required environment variables
const requiredEnvVars = ['VIRUSTOTAL_API_KEY', 'PGPASSWORD'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

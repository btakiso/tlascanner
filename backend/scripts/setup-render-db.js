/**
 * Database setup script for Render deployment
 * This script will run after the database is created on Render
 * to set up the required PostgreSQL extensions
 */

const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Render PostgreSQL
    }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Creating extensions...');
    // Create required extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    
    console.log('Extensions created successfully!');
    
    // Run any additional database setup here
    // For example, creating tables if they don't exist
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();

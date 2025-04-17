// Script to check database tables and create missing ones
const { Client } = require('pg');

// Connection details for Render PostgreSQL
const client = new Client({
  host: 'dpg-cvvdpradbo4c7383sah0-a.virginia-postgres.render.com',
  user: 'tlascanner_user',
  password: 't42xSUe1DCS0P3xtl6n3LvMSX7Fm0i67',
  database: 'tlascanner',
  ssl: {
    rejectUnauthorized: false
  }
});

// Expected tables in the TLAScanner database
const expectedTables = [
  'users',
  'api_keys',
  'url_scans',
  'file_scans',
  'cve_cache',
  'cve_searches',
  'malware_analysis'
];

// SQL to create tables if they don't exist
const createTableSQL = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP WITH TIME ZONE,
      account_status VARCHAR(50) DEFAULT 'active',
      verification_token UUID,
      is_verified BOOLEAN DEFAULT FALSE,
      reset_token UUID,
      reset_token_expires TIMESTAMP WITH TIME ZONE
    );
  `,
  api_keys: `
    CREATE TABLE IF NOT EXISTS api_keys (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      api_key VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      last_used TIMESTAMP WITH TIME ZONE,
      expires_at TIMESTAMP WITH TIME ZONE,
      is_active BOOLEAN DEFAULT TRUE
    );
  `,
  url_scans: `
    CREATE TABLE IF NOT EXISTS url_scans (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      url TEXT NOT NULL,
      scan_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) DEFAULT 'pending',
      results JSONB,
      error_message TEXT,
      scan_duration INTEGER,
      ip_address VARCHAR(45),
      user_agent TEXT
    );
  `,
  file_scans: `
    CREATE TABLE IF NOT EXISTS file_scans (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      file_name VARCHAR(255) NOT NULL,
      file_size BIGINT NOT NULL,
      file_hash VARCHAR(255) NOT NULL,
      mime_type VARCHAR(255),
      scan_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) DEFAULT 'pending',
      results JSONB,
      error_message TEXT,
      scan_duration INTEGER,
      ip_address VARCHAR(45),
      user_agent TEXT
    );
  `,
  cve_cache: `
    CREATE TABLE IF NOT EXISTS cve_cache (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      cve_id VARCHAR(255) UNIQUE,
      search_keyword TEXT UNIQUE,
      response_data JSONB,
      cve_data JSONB,
      cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_cve_cache_cve_id ON cve_cache(cve_id);
    CREATE INDEX IF NOT EXISTS idx_cve_cache_search_keyword ON cve_cache(search_keyword);
    CREATE INDEX IF NOT EXISTS idx_cve_cache_cached_at ON cve_cache(cached_at);
  `,
  cve_searches: `
    CREATE TABLE IF NOT EXISTS cve_searches (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      cve_id VARCHAR(255),
      search_keyword TEXT,
      search_params JSONB,
      results_count INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      ip_address VARCHAR(45),
      user_agent TEXT
    );
    
    CREATE INDEX IF NOT EXISTS idx_cve_searches_user_id ON cve_searches(user_id);
    CREATE INDEX IF NOT EXISTS idx_cve_searches_cve_id ON cve_searches(cve_id);
    CREATE INDEX IF NOT EXISTS idx_cve_searches_search_keyword ON cve_searches(search_keyword);
    CREATE INDEX IF NOT EXISTS idx_cve_searches_created_at ON cve_searches(created_at);
  `,
  malware_analysis: `
    CREATE TABLE IF NOT EXISTS malware_analysis (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      scan_id UUID,
      scan_type VARCHAR(50) NOT NULL,
      file_hash VARCHAR(255),
      url TEXT,
      analysis_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      threat_score DECIMAL(5,2),
      detection_name VARCHAR(255),
      analysis_results JSONB,
      sandbox_results JSONB,
      static_analysis JSONB,
      dynamic_analysis JSONB
    );
    
    CREATE INDEX IF NOT EXISTS idx_malware_analysis_file_hash ON malware_analysis(file_hash);
    CREATE INDEX IF NOT EXISTS idx_malware_analysis_scan_id ON malware_analysis(scan_id);
  `
};

async function checkAndCreateTables() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database on Render');

    // Check for required extensions
    console.log('Checking for required PostgreSQL extensions...');
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `);
    console.log('PostgreSQL extensions verified');

    // Get existing tables
    const res = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);
    
    const existingTables = res.rows.map(row => row.tablename);
    console.log('Existing tables:', existingTables.join(', '));
    
    // Check for missing tables
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length === 0) {
      console.log('All expected tables exist in the database.');
    } else {
      console.log('Missing tables:', missingTables.join(', '));
      
      // Create missing tables
      for (const table of missingTables) {
        console.log(`Creating table: ${table}`);
        await client.query(createTableSQL[table]);
        console.log(`Table ${table} created successfully`);
      }
    }
    
    console.log('Database table check completed successfully');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

checkAndCreateTables();

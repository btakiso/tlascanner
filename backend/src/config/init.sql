-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS url_scans;
DROP TABLE IF EXISTS file_scans;
DROP TABLE IF EXISTS cve_cache;
DROP TABLE IF EXISTS malware_analysis;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS api_keys;
DROP TABLE IF EXISTS community_feedback;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create api_keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, name)
);

-- Create url_scans table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'url_scans') THEN
        CREATE TABLE url_scans (
            id SERIAL PRIMARY KEY,
            url TEXT NOT NULL,
            scan_id TEXT NOT NULL,
            results JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$;

-- Create index on scan_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_url_scans_scan_id') THEN
        CREATE INDEX idx_url_scans_scan_id ON url_scans(scan_id);
    END IF;
END $$;

-- Create file_scans table
CREATE TABLE file_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    file_hash VARCHAR(64) NOT NULL,
    file_name TEXT NOT NULL,
    file_type VARCHAR(255),
    file_size BIGINT,
    scan_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    risk_score INTEGER,
    malicious_indicators JSONB,
    scan_results JSONB,
    virustotal_data JSONB,
    malwarebazaar_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT
);

-- Create cve_cache table
CREATE TABLE cve_cache (
    id VARCHAR(20) PRIMARY KEY, -- CVE ID (e.g., CVE-2021-44228)
    description TEXT,
    severity VARCHAR(50),
    cvss_score DECIMAL(3,1),
    affected_products JSONB,
    reference_urls JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    nvd_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create malware_analysis table
CREATE TABLE malware_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_scan_id UUID REFERENCES file_scans(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL,
    analysis_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create community_feedback table
CREATE TABLE community_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id TEXT NOT NULL UNIQUE,
    comments JSONB NOT NULL,
    votes JSONB NOT NULL,
    total_votes JSONB NOT NULL,
    total_comments INTEGER NOT NULL DEFAULT 0,
    total_votes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_file_scans_user_id ON file_scans(user_id);
CREATE INDEX idx_file_scans_hash ON file_scans(file_hash);
CREATE INDEX idx_file_scans_status ON file_scans(scan_status);
CREATE INDEX idx_cve_cache_severity ON cve_cache(severity);
CREATE INDEX idx_malware_analysis_file_scan ON malware_analysis(file_scan_id);
CREATE INDEX idx_community_feedback_scan_id ON community_feedback(scan_id);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_scans_updated_at
    BEFORE UPDATE ON file_scans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_malware_analysis_updated_at
    BEFORE UPDATE ON malware_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_feedback_updated_at
    BEFORE UPDATE ON community_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

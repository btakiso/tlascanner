-- Add file_scans table to store file scanning results
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'file_scans') THEN
        CREATE TABLE file_scans (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            file_name VARCHAR(255) NOT NULL,
            file_size BIGINT NOT NULL,
            file_type VARCHAR(100),
            md5_hash VARCHAR(32),
            sha1_hash VARCHAR(40),
            sha256_hash VARCHAR(64),
            scan_id VARCHAR(100),
            permalink VARCHAR(255),
            scan_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) DEFAULT 'pending',
            stats JSONB,
            results JSONB,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes for faster lookups
        CREATE INDEX idx_file_scans_file_name ON file_scans(file_name);
        CREATE INDEX idx_file_scans_md5_hash ON file_scans(md5_hash);
        CREATE INDEX idx_file_scans_sha256_hash ON file_scans(sha256_hash);
        CREATE INDEX idx_file_scans_scan_date ON file_scans(scan_date);
        CREATE INDEX idx_file_scans_status ON file_scans(status);
        CREATE INDEX idx_file_scans_created_at ON file_scans(created_at);

        RAISE NOTICE 'Created file_scans table';
    ELSE
        RAISE NOTICE 'file_scans table already exists';
    END IF;
END $$;

-- Add comment to the table
COMMENT ON TABLE file_scans IS 'Stores file scanning results and metadata';

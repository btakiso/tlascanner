-- Update file_scans table to match the schema expected by the code
DO $$ 
BEGIN
    -- Check if the table exists but doesn't have the required columns
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'file_scans'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'file_scans' AND column_name = 'md5_hash'
    ) THEN
        -- Drop existing table (make sure this is OK in your environment)
        DROP TABLE IF EXISTS file_scans CASCADE;
        
        -- Create the table with the expected schema
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

        RAISE NOTICE 'Updated file_scans table schema';
    ELSE
        RAISE NOTICE 'file_scans table already has the correct schema or does not exist';
    END IF;
END $$;

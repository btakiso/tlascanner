-- Add cve_searches table to track search history
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cve_searches') THEN
        CREATE TABLE cve_searches (
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

        -- Create indexes for faster lookups
        CREATE INDEX idx_cve_searches_user_id ON cve_searches(user_id);
        CREATE INDEX idx_cve_searches_cve_id ON cve_searches(cve_id);
        CREATE INDEX idx_cve_searches_search_keyword ON cve_searches(search_keyword);
        CREATE INDEX idx_cve_searches_created_at ON cve_searches(created_at);

        RAISE NOTICE 'Created cve_searches table to track search history';
    ELSE
        RAISE NOTICE 'cve_searches table already exists';
    END IF;
END $$;

-- Add comment to the table
COMMENT ON TABLE cve_searches IS 'Tracks all CVE search history, including search parameters and metadata';

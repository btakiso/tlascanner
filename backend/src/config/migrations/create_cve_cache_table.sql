-- Create cve_cache table for storing CVE data
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cve_cache') THEN
        CREATE TABLE cve_cache (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            cve_id VARCHAR(255) UNIQUE,
            search_keyword TEXT UNIQUE,
            response_data JSONB,
            cve_data JSONB,
            cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes for faster lookups
        CREATE INDEX idx_cve_cache_cve_id ON cve_cache(cve_id);
        CREATE INDEX idx_cve_cache_search_keyword ON cve_cache(search_keyword);
        CREATE INDEX idx_cve_cache_cached_at ON cve_cache(cached_at);

        RAISE NOTICE 'Created cve_cache table for storing CVE data';
    ELSE
        RAISE NOTICE 'cve_cache table already exists';
    END IF;
END $$;

-- Add comment to the table
COMMENT ON TABLE cve_cache IS 'Caches CVE data from NVD API to reduce API calls and improve performance';

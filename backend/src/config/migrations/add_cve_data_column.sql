-- Ensure both cve_data and response_data columns exist
DO $$ 
BEGIN
    -- Add cve_data column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'cve_cache' AND column_name = 'cve_data'
    ) THEN
        ALTER TABLE cve_cache ADD COLUMN cve_data JSONB;
        RAISE NOTICE 'Added cve_data column to cve_cache table';
    END IF;

    -- Add response_data column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'cve_cache' AND column_name = 'response_data'
    ) THEN
        ALTER TABLE cve_cache ADD COLUMN response_data JSONB;
        RAISE NOTICE 'Added response_data column to cve_cache table';
    END IF;
END $$;

-- Update existing records to ensure data consistency between columns
DO $$ 
BEGIN
    -- Update cve_data from response_data if cve_data is NULL but response_data exists
    UPDATE cve_cache
    SET cve_data = response_data->'vulnerabilities'->0
    WHERE cve_data IS NULL 
      AND response_data IS NOT NULL 
      AND response_data->'vulnerabilities' IS NOT NULL 
      AND jsonb_array_length(response_data->'vulnerabilities') > 0;

    -- Update response_data from cve_data if response_data is NULL but cve_data exists
    UPDATE cve_cache
    SET response_data = jsonb_build_object(
        'resultsPerPage', 1,
        'startIndex', 0,
        'totalResults', 1,
        'format', 'NVD_CVE',
        'version', '2.0',
        'timestamp', CURRENT_TIMESTAMP,
        'vulnerabilities', jsonb_build_array(cve_data)
    )
    WHERE response_data IS NULL AND cve_data IS NOT NULL;

    RAISE NOTICE 'Updated existing records to ensure data consistency between columns';
END $$;

-- Log migration completion
DO $$ 
BEGIN
    RAISE NOTICE 'Migration completed successfully';
END $$;

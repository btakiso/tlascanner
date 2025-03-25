-- Remove user_id column from cve_searches table
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'cve_searches' AND column_name = 'user_id'
    ) THEN
        -- Drop the index on user_id if it exists
        IF EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE indexname = 'idx_cve_searches_user_id'
        ) THEN
            DROP INDEX idx_cve_searches_user_id;
            RAISE NOTICE 'Dropped index idx_cve_searches_user_id';
        END IF;

        -- Drop the foreign key constraint if it exists
        EXECUTE (
            'ALTER TABLE cve_searches DROP CONSTRAINT IF EXISTS ' || 
            (SELECT conname FROM pg_constraint 
             WHERE conrelid = 'cve_searches'::regclass 
             AND contype = 'f' 
             AND conkey @> ARRAY[
                 (SELECT attnum FROM pg_attribute 
                  WHERE attrelid = 'cve_searches'::regclass 
                  AND attname = 'user_id')
             ])
        );

        -- Remove the column
        ALTER TABLE cve_searches DROP COLUMN user_id;
        RAISE NOTICE 'Removed user_id column from cve_searches table';
    ELSE
        RAISE NOTICE 'user_id column does not exist in cve_searches table';
    END IF;
END $$;

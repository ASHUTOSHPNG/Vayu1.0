-- Create supabase_realtime publication if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Add aqi_readings to the publication
-- We use DO block to avoid error if it's already added
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE aqi_readings;
    EXCEPTION
        WHEN duplicate_object THEN
            NULL; -- Table already in publication
    END;
END $$;

-- Set replica identity to full to ensure we get all data in updates
ALTER TABLE aqi_readings REPLICA IDENTITY FULL;

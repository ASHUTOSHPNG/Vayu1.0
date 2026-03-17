-- Add cron_logs table
CREATE TABLE IF NOT EXISTS cron_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,
    status TEXT NOT NULL,
    records_processed INTEGER DEFAULT 0,
    error_message TEXT,
    ran_at TIMESTAMPTZ DEFAULT now()
);

-- Add weather_cache table
CREATE TABLE IF NOT EXISTS weather_cache (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE cron_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;

-- Admin policies for cron_logs
CREATE POLICY "Admins have full access to cron_logs" ON cron_logs FOR ALL USING (is_admin());

-- Add unique index for hourly upsert target (recorded_at is already hour-truncated in app code)
CREATE UNIQUE INDEX IF NOT EXISTS aqi_readings_location_recorded_at_idx
ON aqi_readings (location_id, recorded_at);

-- Add anomaly_score to aqi_readings
ALTER TABLE aqi_readings ADD COLUMN IF NOT EXISTS anomaly_score FLOAT4 DEFAULT 0;

-- Update comments
COMMENT ON COLUMN aqi_readings.anomaly_score IS 'ML-detected anomaly score (0-10) for this reading';

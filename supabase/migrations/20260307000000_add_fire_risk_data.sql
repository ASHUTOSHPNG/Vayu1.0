ALTER TABLE aqi_readings ADD COLUMN IF NOT EXISTS fire_risk_data JSONB;
ALTER TABLE pollution_sources ADD COLUMN IF NOT EXISTS fire_risk_data JSONB;
ALTER TABLE policy_recommendations ADD COLUMN IF NOT EXISTS fire_risk_data JSONB;

-- Update the comments for clarity
COMMENT ON COLUMN aqi_readings.fire_risk_data IS 'Detailed fire risk assessment data from NASA FIRMS API';
COMMENT ON COLUMN pollution_sources.fire_risk_data IS 'Detailed fire risk assessment data associated with the detected source';
COMMENT ON COLUMN policy_recommendations.fire_risk_data IS 'Detailed fire risk assessment data associated with this recommendation';

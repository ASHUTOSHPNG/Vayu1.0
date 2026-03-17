-- Custom Enums
CREATE TYPE location_type AS ENUM ('ward', 'city', 'landmark', 'custom');
CREATE TYPE source_type AS ENUM ('satellite', 'meteorological', 'iot', 'interpolated');
CREATE TYPE pollution_source_type AS ENUM ('traffic', 'construction', 'biomass_burning', 'industrial', 'unknown');
CREATE TYPE severity_level AS ENUM ('low', 'moderate', 'high', 'critical');
CREATE TYPE recommendation_status AS ENUM ('pending', 'acknowledged', 'actioned', 'dismissed');
CREATE TYPE user_role AS ENUM ('admin', 'citizen');

-- Tables

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    country TEXT NOT NULL DEFAULT 'India',
    latitude FLOAT8 NOT NULL,
    longitude FLOAT8 NOT NULL,
    ward_id TEXT,
    type location_type,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE aqi_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    source source_type,
    aqi_value FLOAT4 NOT NULL,
    pm25 FLOAT4,
    pm10 FLOAT4,
    no2 FLOAT4,
    so2 FLOAT4,
    co FLOAT4,
    o3 FLOAT4,
    temperature FLOAT4,
    humidity FLOAT4,
    wind_speed FLOAT4,
    wind_direction FLOAT4,
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pollution_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    source_type pollution_source_type,
    confidence_score FLOAT4,
    detected_at TIMESTAMPTZ NOT NULL,
    raw_features JSONB
);

CREATE TABLE policy_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    trigger_source TEXT,
    severity severity_level,
    anomaly_summary TEXT,
    recommendation_text TEXT NOT NULL,
    status recommendation_status DEFAULT 'pending',
    generated_by TEXT DEFAULT 'genai',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'citizen',
    preferred_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    notification_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (RLS)

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqi_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pollution_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- locations
CREATE POLICY "Anyone can read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Admins have full access to locations" ON locations FOR ALL USING (is_admin());

-- aqi_readings
CREATE POLICY "Anyone can read aqi_readings" ON aqi_readings FOR SELECT USING (true);
CREATE POLICY "Admins have full access to aqi_readings" ON aqi_readings FOR ALL USING (is_admin());

-- pollution_sources
CREATE POLICY "Admins have full access to pollution_sources" ON pollution_sources FOR ALL USING (is_admin());

-- policy_recommendations
CREATE POLICY "Admins have full access to policy_recommendations" ON policy_recommendations FOR ALL USING (is_admin());

-- user_profiles
CREATE POLICY "Users can read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to user_profiles" ON user_profiles FOR ALL USING (is_admin());

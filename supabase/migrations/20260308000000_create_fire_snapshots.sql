-- Create fire_snapshots table for historical archiving of regional fire activity
CREATE TABLE IF NOT EXISTS fire_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_name TEXT NOT NULL,
  bbox JSONB NOT NULL,
  hotspot_count INTEGER NOT NULL DEFAULT 0,
  high_confidence_count INTEGER NOT NULL DEFAULT 0,
  max_frp FLOAT,
  avg_frp FLOAT,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB, -- stores actual hotspot list or risk summary if needed
  UNIQUE(region_name, snapshot_date)
);

COMMENT ON TABLE fire_snapshots IS 'Stores daily regional fire activity summaries from NASA FIRMS.';

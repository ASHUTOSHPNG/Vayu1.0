-- Create push_subscriptions table for Web Push
CREATE TABLE IF NOT EXISTS push_subscriptions (
    endpoint TEXT PRIMARY KEY,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    threshold_aqi INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to register (upsert) subscriptions
CREATE POLICY "Allow public registration" ON push_subscriptions
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- Also allow authenticated users (just in case)
CREATE POLICY "Allow authenticated registration" ON push_subscriptions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

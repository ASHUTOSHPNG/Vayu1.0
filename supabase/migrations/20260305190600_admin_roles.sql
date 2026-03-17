-- Add admin support columns to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS admin_type
    TEXT CHECK (admin_type IN ('city_admin', 'central_admin')) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS assigned_city_id
    UUID REFERENCES locations(id) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS assigned_city_name
    TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_active
    BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS last_login_at
    TIMESTAMPTZ DEFAULT NULL;

-- Create admin_invitations table
CREATE TABLE IF NOT EXISTS admin_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT UNIQUE NOT NULL,
  admin_type TEXT NOT NULL CHECK (admin_type IN ('city_admin', 'central_admin')),
  assigned_city_id UUID REFERENCES locations(id),
  assigned_city_name TEXT,
  used_by UUID REFERENCES auth.users(id) DEFAULT NULL,
  used_at TIMESTAMPTZ DEFAULT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy for admin_invitations
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_invitations' 
        AND policyname = 'central_admin_manage_invitations'
    ) THEN
        CREATE POLICY "central_admin_manage_invitations"
        ON admin_invitations
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.admin_type = 'central_admin'
          )
        );
    END IF;
END $$;

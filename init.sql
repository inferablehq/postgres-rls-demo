-- Create the users table first
CREATE TABLE users (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE key_value (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraint
ALTER TABLE key_value
    ADD CONSTRAINT unique_username_key UNIQUE (username, key);

-- Enable row level security
ALTER TABLE key_value ENABLE ROW LEVEL SECURITY;

-- Create application user with CREATEROLE privilege
CREATE ROLE app_user WITH LOGIN PASSWORD 'your_password_here' CREATEROLE;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON key_value TO app_user;
GRANT USAGE, SELECT ON SEQUENCE key_value_id_seq TO app_user;

-- Create RLS policy based on current_user
CREATE POLICY manage_own_data ON key_value
    FOR ALL
    USING (username = current_user)
    WITH CHECK (username = current_user);

-- Force RLS
ALTER TABLE key_value FORCE ROW LEVEL SECURITY;
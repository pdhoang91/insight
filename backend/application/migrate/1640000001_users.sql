/* Creating users table */

CREATE TABLE IF NOT EXISTS users
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email varchar(255) UNIQUE NOT NULL,
    name varchar(255),
    username varchar(255) UNIQUE,
    password varchar(255),
    google_id varchar(255),
    avatar_url text,
    bio text,
    phone varchar(50),
    dob varchar(50),
    role varchar(50) DEFAULT 'user',
    email_verified boolean DEFAULT false,
    verification_token varchar(255),
    password_reset_token varchar(255),
    password_reset_expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

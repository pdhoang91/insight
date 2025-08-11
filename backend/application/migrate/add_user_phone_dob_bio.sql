-- Migration: Add phone, dob and bio fields to user table
-- Date: 2024-01-XX  
-- Description: Add phone, date_of_birth and bio columns to users table

-- Add phone column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add dob column if it doesn't exist  
ALTER TABLE users ADD COLUMN IF NOT EXISTS dob VARCHAR(20);

-- Add bio column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add comments for the columns
COMMENT ON COLUMN users.phone IS 'User phone number';
COMMENT ON COLUMN users.dob IS 'User date of birth'; 
COMMENT ON COLUMN users.bio IS 'User biography/description (max 500 characters)'; 
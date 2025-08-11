-- Migration: Update user table to replace phone and dob with bio field
-- Date: 2024-01-XX
-- Description: Replace phone and date_of_birth columns with bio column

-- Add bio column
ALTER TABLE users ADD COLUMN bio TEXT;

-- Remove old columns
ALTER TABLE users DROP COLUMN IF EXISTS phone;
ALTER TABLE users DROP COLUMN IF EXISTS dob;

-- Add comment for bio column
COMMENT ON COLUMN users.bio IS 'User biography/description (max 500 characters)'; 
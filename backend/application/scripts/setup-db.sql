-- Database setup script for Image functionality
-- Run this if you encounter UUID extension issues

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify extension is enabled
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- Test UUID generation
SELECT uuid_generate_v4() as test_uuid;

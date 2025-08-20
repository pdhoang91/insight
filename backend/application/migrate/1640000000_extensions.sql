/* Creating database extensions */

-- UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Unaccent extension for accent-insensitive Vietnamese search
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

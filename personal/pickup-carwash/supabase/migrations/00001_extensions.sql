-- Enable PostGIS for future geo optimization (optional but recommended)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pgcrypto for UUID generation (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable pg_trgm for text search (optional, for merchant name search)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

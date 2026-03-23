-- =============================================================
-- Insight Blog — Complete Database Schema
-- =============================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Trigger function: auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Immutable unaccent wrapper (required for use inside index expressions)
CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
RETURNS text AS $$
BEGIN
    RETURN public.unaccent($1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Recursively extract plain text from a TipTap/ProseMirror JSONB document
CREATE OR REPLACE FUNCTION extract_text_from_json_doc(doc jsonb)
RETURNS text AS $$
DECLARE
    result text := '';
    child  jsonb;
BEGIN
    IF doc IS NULL THEN RETURN ''; END IF;
    IF doc->>'text' IS NOT NULL THEN
        result := result || ' ' || (doc->>'text');
    END IF;
    IF doc->'content' IS NOT NULL AND jsonb_typeof(doc->'content') = 'array' THEN
        FOR child IN SELECT jsonb_array_elements(doc->'content') LOOP
            result := result || extract_text_from_json_doc(child);
        END LOOP;
    END IF;
    RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    email             VARCHAR(255) NOT NULL,
    name              VARCHAR(255),
    username          VARCHAR(255),
    password          VARCHAR(255),
    google_id         VARCHAR(255),
    google_picture_url VARCHAR(500),
    avatar_url        VARCHAR(500),
    bio               TEXT,
    phone             VARCHAR(255),
    dob               VARCHAR(255),
    role              VARCHAR(50)  NOT NULL DEFAULT 'user',
    email_verified    BOOLEAN      NOT NULL DEFAULT false,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tags (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    title            VARCHAR(500) NOT NULL,
    slug             VARCHAR(500) UNIQUE,
    excerpt          TEXT,
    cover_image      VARCHAR(500),
    user_id          UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    views            INTEGER      NOT NULL DEFAULT 0,
    comment_count    BIGINT       NOT NULL DEFAULT 0,
    engagement_score FLOAT        NOT NULL DEFAULT 0,
    -- Pre-computed full-text search vector (title + excerpt)
    document         tsvector     GENERATED ALWAYS AS (
                         to_tsvector('english',
                             coalesce(title, '') || ' ' || coalesce(excerpt, ''))
                     ) STORED,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at       TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS post_contents (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    content    JSONB       NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_post_contents_post_id UNIQUE (post_id)
);

CREATE TABLE IF NOT EXISTS comments (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS replies (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID        NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS post_categories (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id     UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    category_id UUID        NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (post_id, category_id)
);

CREATE TABLE IF NOT EXISTS post_tags (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id     UUID        NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS images (
    id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    storage_key       VARCHAR(255) NOT NULL,
    storage_provider  VARCHAR(255) NOT NULL DEFAULT 's3',
    original_filename VARCHAR(255) NOT NULL,
    content_type      VARCHAR(100) NOT NULL,
    file_size         BIGINT       NOT NULL,
    image_type        VARCHAR(50)  NOT NULL,
    user_id           UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    width             INTEGER,
    height            INTEGER,
    alt               VARCHAR(255),
    public_url        TEXT,
    thumb_url         TEXT,
    medium_url        TEXT,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS image_references (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_id   UUID        NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    ref_type   VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TRIGGERS (auto-update updated_at)
-- =====================================================

DROP TRIGGER IF EXISTS update_users_updated_at         ON users;
DROP TRIGGER IF EXISTS update_categories_updated_at    ON categories;
DROP TRIGGER IF EXISTS update_tags_updated_at          ON tags;
DROP TRIGGER IF EXISTS update_posts_updated_at         ON posts;
DROP TRIGGER IF EXISTS update_post_contents_updated_at ON post_contents;
DROP TRIGGER IF EXISTS update_comments_updated_at      ON comments;
DROP TRIGGER IF EXISTS update_replies_updated_at       ON replies;
DROP TRIGGER IF EXISTS update_images_updated_at        ON images;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_contents_updated_at
    BEFORE UPDATE ON post_contents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_replies_updated_at
    BEFORE UPDATE ON replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_images_updated_at
    BEFORE UPDATE ON images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INDEXES
-- =====================================================

-- users
CREATE INDEX IF NOT EXISTS idx_users_name_fts ON users USING gin(to_tsvector('simple', coalesce(name, '')));
CREATE INDEX IF NOT EXISTS idx_users_bio_fts  ON users USING gin(to_tsvector('simple', coalesce(bio, '')));

-- posts — scalar lookups
CREATE INDEX IF NOT EXISTS idx_posts_user_id       ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug          ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_deleted_at    ON posts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_posts_views         ON posts(views DESC);
-- posts — sorting/filtering on active rows
CREATE INDEX IF NOT EXISTS idx_posts_created_at    ON posts(created_at DESC)        WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_engagement    ON posts(engagement_score DESC)  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_comment_count ON posts(comment_count);
-- posts — composite (user feed)
CREATE INDEX IF NOT EXISTS idx_posts_user_created  ON posts(user_id, created_at DESC) WHERE deleted_at IS NULL;
-- posts — full-text search
CREATE INDEX IF NOT EXISTS idx_posts_document      ON posts USING GIN (document);
CREATE INDEX IF NOT EXISTS idx_posts_title_en      ON posts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_posts_title_vi      ON posts USING gin(to_tsvector('simple', coalesce(title, '')));
CREATE INDEX IF NOT EXISTS idx_posts_excerpt_vi    ON posts USING gin(to_tsvector('simple', coalesce(excerpt, '')));
CREATE INDEX IF NOT EXISTS trgm_idx_posts_title    ON posts USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS trgm_idx_posts_excerpt  ON posts USING gin(excerpt gin_trgm_ops);

-- post_contents
CREATE INDEX IF NOT EXISTS idx_post_contents_post_id    ON post_contents(post_id);
CREATE INDEX IF NOT EXISTS idx_post_contents_deleted_at ON post_contents(deleted_at);
CREATE INDEX IF NOT EXISTS idx_post_contents_content    ON post_contents USING GIN (content);

-- comments
CREATE INDEX IF NOT EXISTS idx_comments_user_id     ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at  ON comments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_comments_post_active ON comments(post_id, created_at DESC) WHERE deleted_at IS NULL;

-- replies
CREATE INDEX IF NOT EXISTS idx_replies_post_id        ON replies(post_id);
CREATE INDEX IF NOT EXISTS idx_replies_user_id        ON replies(user_id);
CREATE INDEX IF NOT EXISTS idx_replies_deleted_at     ON replies(deleted_at);
CREATE INDEX IF NOT EXISTS idx_replies_comment_active ON replies(comment_id, created_at ASC) WHERE deleted_at IS NULL;

-- categories
CREATE INDEX IF NOT EXISTS idx_categories_name     ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_name_fts ON categories USING gin(to_tsvector('english', name));

-- tags
CREATE INDEX IF NOT EXISTS idx_tags_name     ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_name_fts ON tags USING gin(to_tsvector('english', name));

-- post_categories (composite for both join directions)
CREATE INDEX IF NOT EXISTS idx_post_categories_post_category ON post_categories(post_id, category_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_category_post ON post_categories(category_id, post_id);

-- post_tags (composite for both join directions)
CREATE INDEX IF NOT EXISTS idx_post_tags_post_tag ON post_tags(post_id, tag_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_post ON post_tags(tag_id, post_id);

-- images
CREATE INDEX IF NOT EXISTS idx_images_user_id     ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_storage_key ON images(storage_key);
CREATE INDEX IF NOT EXISTS idx_images_image_type  ON images(image_type);

-- image_references
CREATE INDEX IF NOT EXISTS idx_image_references_image_id ON image_references(image_id);
CREATE INDEX IF NOT EXISTS idx_image_references_post_id  ON image_references(post_id);

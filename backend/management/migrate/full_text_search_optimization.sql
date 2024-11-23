
--Implement tsvector and tsquery: Sử dụng tsvector cho các trường title và content, và tsquery để thực hiện tìm kiếm
ALTER TABLE posts ADD COLUMN document tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
) STORED;

CREATE INDEX idx_posts_document ON posts USING GIN (document);



CREATE EXTENSION pg_trgm;
CREATE INDEX trgm_idx_title ON posts USING gin (title gin_trgm_ops);
CREATE INDEX trgm_idx_preview_content ON posts USING gin (preview_content gin_trgm_ops);


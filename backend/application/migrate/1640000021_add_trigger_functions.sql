/* Adding trigger functions to automatically update denormalized counts */

-- Function to update posts comments_count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment comments_count when new comment is added
        UPDATE posts 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.post_id AND NEW.status = 'active';
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.status != NEW.status THEN
            IF OLD.status = 'active' AND NEW.status != 'active' THEN
                -- Comment became inactive, decrement count
                UPDATE posts 
                SET comments_count = GREATEST(0, comments_count - 1) 
                WHERE id = NEW.post_id;
            ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
                -- Comment became active, increment count
                UPDATE posts 
                SET comments_count = comments_count + 1 
                WHERE id = NEW.post_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement comments_count when comment is deleted
        IF OLD.status = 'active' THEN
            UPDATE posts 
            SET comments_count = GREATEST(0, comments_count - 1) 
            WHERE id = OLD.post_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comments replies_count
CREATE OR REPLACE FUNCTION update_comment_replies_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment replies_count when new reply is added
        UPDATE comments 
        SET replies_count = replies_count + 1 
        WHERE id = NEW.comment_id AND NEW.status = 'active';
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.status != NEW.status THEN
            IF OLD.status = 'active' AND NEW.status != 'active' THEN
                -- Reply became inactive, decrement count
                UPDATE comments 
                SET replies_count = GREATEST(0, replies_count - 1) 
                WHERE id = NEW.comment_id;
            ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
                -- Reply became active, increment count
                UPDATE comments 
                SET replies_count = replies_count + 1 
                WHERE id = NEW.comment_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement replies_count when reply is deleted
        IF OLD.status = 'active' THEN
            UPDATE comments 
            SET replies_count = GREATEST(0, replies_count - 1) 
            WHERE id = OLD.comment_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update claps_count for posts, comments, and replies
CREATE OR REPLACE FUNCTION update_claps_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment claps_count when new clap activity is added
        IF NEW.action_type = 'clap_post' AND NEW.post_id IS NOT NULL THEN
            UPDATE posts 
            SET claps_count = claps_count + NEW.clap_count 
            WHERE id = NEW.post_id;
        ELSIF NEW.action_type = 'clap_comment' AND NEW.comment_id IS NOT NULL THEN
            UPDATE comments 
            SET claps_count = claps_count + NEW.clap_count 
            WHERE id = NEW.comment_id;
        ELSIF NEW.action_type = 'clap_reply' AND NEW.reply_id IS NOT NULL THEN
            UPDATE replies 
            SET claps_count = claps_count + NEW.clap_count 
            WHERE id = NEW.reply_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle clap_count changes
        IF OLD.clap_count != NEW.clap_count THEN
            DECLARE
                count_diff INTEGER := NEW.clap_count - OLD.clap_count;
            BEGIN
                IF NEW.action_type = 'clap_post' AND NEW.post_id IS NOT NULL THEN
                    UPDATE posts 
                    SET claps_count = GREATEST(0, claps_count + count_diff) 
                    WHERE id = NEW.post_id;
                ELSIF NEW.action_type = 'clap_comment' AND NEW.comment_id IS NOT NULL THEN
                    UPDATE comments 
                    SET claps_count = GREATEST(0, claps_count + count_diff) 
                    WHERE id = NEW.comment_id;
                ELSIF NEW.action_type = 'clap_reply' AND NEW.reply_id IS NOT NULL THEN
                    UPDATE replies 
                    SET claps_count = GREATEST(0, claps_count + count_diff) 
                    WHERE id = NEW.reply_id;
                END IF;
            END;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement claps_count when clap activity is deleted
        IF OLD.action_type = 'clap_post' AND OLD.post_id IS NOT NULL THEN
            UPDATE posts 
            SET claps_count = GREATEST(0, claps_count - OLD.clap_count) 
            WHERE id = OLD.post_id;
        ELSIF OLD.action_type = 'clap_comment' AND OLD.comment_id IS NOT NULL THEN
            UPDATE comments 
            SET claps_count = GREATEST(0, claps_count - OLD.clap_count) 
            WHERE id = OLD.comment_id;
        ELSIF OLD.action_type = 'clap_reply' AND OLD.reply_id IS NOT NULL THEN
            UPDATE replies 
            SET claps_count = GREATEST(0, claps_count - OLD.clap_count) 
            WHERE id = OLD.reply_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON comments;
CREATE TRIGGER trigger_update_post_comments_count
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

DROP TRIGGER IF EXISTS trigger_update_comment_replies_count ON replies;
CREATE TRIGGER trigger_update_comment_replies_count
    AFTER INSERT OR UPDATE OR DELETE ON replies
    FOR EACH ROW EXECUTE FUNCTION update_comment_replies_count();

DROP TRIGGER IF EXISTS trigger_update_claps_count ON user_activities;
CREATE TRIGGER trigger_update_claps_count
    AFTER INSERT OR UPDATE OR DELETE ON user_activities
    FOR EACH ROW EXECUTE FUNCTION update_claps_count();

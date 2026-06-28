-- ========================================================
-- BEAR Platform - Triggers
-- ========================================================

-- Generic update timestamp trigger function
CREATE OR REPLACE FUNCTION bear_tr_update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Auto insert log trigger function
CREATE OR REPLACE FUNCTION bear_tr_insert_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO bear_system_logs (level, source, message, details)
    VALUES (
        'info',
        TG_TABLE_NAME,
        TG_OP || ' on ' || TG_TABLE_NAME,
        jsonb_build_object(
            'operation', TG_OP,
            'table', TG_TABLE_NAME,
            'record_id', CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END
        )
    );
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

-- Apply update timestamp triggers
CREATE OR REPLACE TRIGGER bear_users_updated_at
    BEFORE UPDATE ON bear_users
    FOR EACH ROW EXECUTE FUNCTION bear_tr_update_timestamp();

CREATE OR REPLACE TRIGGER bear_profiles_updated_at
    BEFORE UPDATE ON bear_profiles
    FOR EACH ROW EXECUTE FUNCTION bear_tr_update_timestamp();

CREATE OR REPLACE TRIGGER bear_plans_updated_at
    BEFORE UPDATE ON bear_plans
    FOR EACH ROW EXECUTE FUNCTION bear_tr_update_timestamp();

CREATE OR REPLACE TRIGGER bear_licenses_updated_at
    BEFORE UPDATE ON bear_licenses
    FOR EACH ROW EXECUTE FUNCTION bear_tr_update_timestamp();

CREATE OR REPLACE TRIGGER bear_devices_updated_at
    BEFORE UPDATE ON bear_devices
    FOR EACH ROW EXECUTE FUNCTION bear_tr_update_timestamp();

CREATE OR REPLACE TRIGGER bear_versions_updated_at
    BEFORE UPDATE ON bear_versions
    FOR EACH ROW EXECUTE FUNCTION bear_tr_update_timestamp();

CREATE OR REPLACE TRIGGER bear_downloads_updated_at
    BEFORE UPDATE ON bear_downloads
    FOR EACH ROW EXECUTE FUNCTION bear_tr_update_timestamp();

CREATE OR REPLACE TRIGGER bear_tickets_updated_at
    BEFORE UPDATE ON bear_tickets
    FOR EACH ROW EXECUTE FUNCTION bear_tr_update_timestamp();

CREATE OR REPLACE TRIGGER bear_ticket_messages_updated_at
    BEFORE UPDATE ON bear_ticket_messages
    FOR EACH ROW EXECUTE FUNCTION bear_tr_update_timestamp();

CREATE OR REPLACE TRIGGER bear_feature_flags_updated_at
    BEFORE UPDATE ON bear_feature_flags
    FOR EACH ROW EXECUTE FUNCTION bear_tr_update_timestamp();

CREATE OR REPLACE TRIGGER bear_remote_configs_updated_at
    BEFORE UPDATE ON bear_remote_configs
    FOR EACH ROW EXECUTE FUNCTION bear_tr_update_timestamp();

CREATE OR REPLACE TRIGGER bear_settings_updated_at
    BEFORE UPDATE ON bear_settings
    FOR EACH ROW EXECUTE FUNCTION bear_tr_update_timestamp();

CREATE OR REPLACE TRIGGER bear_modules_updated_at
    BEFORE UPDATE ON bear_modules
    FOR EACH ROW EXECUTE FUNCTION bear_tr_update_timestamp();

CREATE OR REPLACE TRIGGER bear_announcements_updated_at
    BEFORE UPDATE ON bear_announcements
    FOR EACH ROW EXECUTE FUNCTION bear_tr_update_timestamp();

-- Apply system log triggers to critical tables
CREATE OR REPLACE TRIGGER bear_licenses_log
    AFTER INSERT OR UPDATE OR DELETE ON bear_licenses
    FOR EACH ROW EXECUTE FUNCTION bear_tr_insert_log();

CREATE OR REPLACE TRIGGER bear_users_log
    AFTER INSERT OR DELETE ON bear_users
    FOR EACH ROW EXECUTE FUNCTION bear_tr_insert_log();

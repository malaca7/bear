-- ========================================================
-- BEAR Platform - Enums
-- ========================================================
-- All enums use the bear_ prefix to avoid conflicts

DO $$ BEGIN
    CREATE TYPE bear_license_status AS ENUM (
        'active',
        'suspended',
        'expired',
        'revoked',
        'trial'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE bear_plan_type AS ENUM (
        'free',
        'basic',
        'standard',
        'premium',
        'enterprise'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE bear_user_role AS ENUM (
        'admin',
        'moderator',
        'support',
        'client'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE bear_ticket_status AS ENUM (
        'open',
        'in_progress',
        'waiting_client',
        'waiting_support',
        'resolved',
        'closed'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE bear_notification_type AS ENUM (
        'info',
        'warning',
        'update',
        'maintenance',
        'promotion'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE bear_log_action AS ENUM (
        'login',
        'logout',
        'failure',
        'change',
        'update',
        'license',
        'config',
        'ticket',
        'download'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

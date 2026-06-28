-- ========================================================
-- BEAR Platform - Notifications & Announcements
-- ========================================================

CREATE TABLE IF NOT EXISTS bear_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES bear_users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type bear_notification_type NOT NULL DEFAULT 'info',
    is_global BOOLEAN NOT NULL DEFAULT false,
    is_read BOOLEAN NOT NULL DEFAULT false,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bear_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type bear_notification_type NOT NULL DEFAULT 'info',
    target_plans bear_plan_type[] DEFAULT '{}',
    target_roles bear_user_role[] DEFAULT '{}',
    banner_url TEXT,
    action_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 0,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at TIMESTAMPTZ,
    created_by UUID REFERENCES bear_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bear_notifications_user ON bear_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_bear_notifications_type ON bear_notifications(type);
CREATE INDEX IF NOT EXISTS idx_bear_notifications_global ON bear_notifications(is_global);
CREATE INDEX IF NOT EXISTS idx_bear_notifications_read ON bear_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_bear_announcements_active ON bear_announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_bear_announcements_dates ON bear_announcements(starts_at, ends_at);

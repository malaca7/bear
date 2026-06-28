-- ========================================================
-- BEAR Platform - Logs (System & Activity)
-- ========================================================

CREATE TABLE IF NOT EXISTS bear_system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) NOT NULL DEFAULT 'info',
    source VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    stack_trace TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bear_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES bear_users(id) ON DELETE SET NULL,
    action bear_log_action NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bear_system_logs_level ON bear_system_logs(level);
CREATE INDEX IF NOT EXISTS idx_bear_system_logs_source ON bear_system_logs(source);
CREATE INDEX IF NOT EXISTS idx_bear_system_logs_created ON bear_system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_bear_activity_logs_user ON bear_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_bear_activity_logs_action ON bear_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_bear_activity_logs_resource ON bear_activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_bear_activity_logs_created ON bear_activity_logs(created_at);

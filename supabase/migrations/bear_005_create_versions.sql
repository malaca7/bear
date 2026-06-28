-- ========================================================
-- BEAR Platform - Versions & Updates
-- ========================================================

CREATE TABLE IF NOT EXISTS bear_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(20) NOT NULL UNIQUE,
    version_code INTEGER NOT NULL UNIQUE,
    title VARCHAR(200),
    description TEXT,
    changelog TEXT,
    download_url TEXT,
    file_size BIGINT DEFAULT 0,
    file_hash VARCHAR(128),
    min_os_version VARCHAR(20),
    is_mandatory BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES bear_users(id),
    min_plan bear_plan_type DEFAULT 'free',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bear_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES bear_versions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES bear_users(id) ON DELETE CASCADE,
    from_version VARCHAR(20),
    to_version VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bear_versions_version ON bear_versions(version);
CREATE INDEX IF NOT EXISTS idx_bear_versions_published ON bear_versions(is_published);
CREATE INDEX IF NOT EXISTS idx_bear_versions_version_code ON bear_versions(version_code);
CREATE INDEX IF NOT EXISTS idx_bear_updates_user ON bear_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_bear_updates_version ON bear_updates(version_id);

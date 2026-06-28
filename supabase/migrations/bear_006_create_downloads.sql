-- ========================================================
-- BEAR Platform - Downloads
-- ========================================================

CREATE TABLE IF NOT EXISTS bear_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES bear_versions(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size BIGINT DEFAULT 0,
    file_hash VARCHAR(128),
    mime_type VARCHAR(100),
    download_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    min_plan bear_plan_type DEFAULT 'free',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bear_download_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    download_id UUID NOT NULL REFERENCES bear_downloads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES bear_users(id) ON DELETE SET NULL,
    version_id UUID REFERENCES bear_versions(id),
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bear_downloads_version ON bear_downloads(version_id);
CREATE INDEX IF NOT EXISTS idx_bear_downloads_active ON bear_downloads(is_active);
CREATE INDEX IF NOT EXISTS idx_bear_download_logs_download ON bear_download_logs(download_id);
CREATE INDEX IF NOT EXISTS idx_bear_download_logs_user ON bear_download_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_bear_download_logs_created ON bear_download_logs(created_at);

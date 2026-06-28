-- ========================================================
-- BEAR Platform - Feature Flags
-- ========================================================

CREATE TABLE IF NOT EXISTS bear_feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    required_plan bear_plan_type DEFAULT 'free',
    min_version VARCHAR(20),
    max_version VARCHAR(20),
    target_percentage INTEGER DEFAULT 100,
    conditions JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bear_feature_flags_name ON bear_feature_flags(name);
CREATE INDEX IF NOT EXISTS idx_bear_feature_flags_enabled ON bear_feature_flags(is_enabled);
CREATE INDEX IF NOT EXISTS idx_bear_feature_flags_plan ON bear_feature_flags(required_plan);

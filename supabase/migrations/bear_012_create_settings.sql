-- ========================================================
-- BEAR Platform - Settings & Statistics
-- ========================================================

CREATE TABLE IF NOT EXISTS bear_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(200) NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bear_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(200) NOT NULL,
    metric_value DECIMAL(20,4) NOT NULL DEFAULT 0,
    dimension VARCHAR(100),
    dimension_value VARCHAR(200),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default settings
INSERT INTO bear_settings (key, value, description, is_public) VALUES
    ('bear.app_name', '"BEAR"', 'Nome do aplicativo', true),
    ('bear.app_version', '"1.0.0"', 'Versão atual do sistema', true),
    ('bear.maintenance', 'false', 'Modo manutenção', true),
    ('bear.registration_enabled', 'true', 'Cadastro habilitado', true),
    ('bear.max_login_attempts', '5', 'Tentativas máximas de login', false),
    ('bear.session_timeout_hours', '24', 'Timeout da sessão em horas', false),
    ('bear.auto_update_enabled', 'true', 'Auto-update habilitado', true)
ON CONFLICT (key) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bear_settings_key ON bear_settings(key);
CREATE INDEX IF NOT EXISTS idx_bear_settings_public ON bear_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_bear_statistics_metric ON bear_statistics(metric_name);
CREATE INDEX IF NOT EXISTS idx_bear_statistics_period ON bear_statistics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_bear_statistics_dimension ON bear_statistics(dimension, dimension_value);

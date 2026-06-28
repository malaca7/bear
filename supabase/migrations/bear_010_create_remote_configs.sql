-- ========================================================
-- BEAR Platform - Remote Configs
-- ========================================================

CREATE TABLE IF NOT EXISTS bear_remote_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(200) NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    is_active BOOLEAN NOT NULL DEFAULT true,
    target_plans bear_plan_type[] DEFAULT '{}',
    min_version VARCHAR(20),
    max_version VARCHAR(20),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default configs
INSERT INTO bear_remote_configs (key, value, description, category) VALUES
    ('app.maintenance_mode', '{"enabled": false, "message": "Sistema em manutenção. Voltamos em breve."}', 'Modo de manutenção', 'system'),
    ('app.min_version', '{"version": "1.0.0", "force_update": false}', 'Versão mínima do app', 'system'),
    ('app.welcome_message', '{"title": "Bem-vindo ao BEAR!", "subtitle": "Sua plataforma de gerenciamento"}', 'Mensagem de boas-vindas', 'ui'),
    ('app.banner', '{"url": "", "link": "", "enabled": false}', 'Banner principal', 'ui'),
    ('app.features', '{"chat": true, "notifications": true, "auto_update": true}', 'Funcionalidades globais', 'features')
ON CONFLICT (key) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bear_remote_configs_key ON bear_remote_configs(key);
CREATE INDEX IF NOT EXISTS idx_bear_remote_configs_category ON bear_remote_configs(category);
CREATE INDEX IF NOT EXISTS idx_bear_remote_configs_active ON bear_remote_configs(is_active);

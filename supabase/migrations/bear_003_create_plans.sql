-- ========================================================
-- BEAR Platform - Plans & Modules
-- ========================================================

CREATE TABLE IF NOT EXISTS bear_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type bear_plan_type NOT NULL DEFAULT 'free',
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    duration_days INTEGER NOT NULL DEFAULT 30,
    max_devices INTEGER NOT NULL DEFAULT 1,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bear_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bear_module_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES bear_modules(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES bear_plans(id) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(module_id, plan_id)
);

-- Seed default plans
INSERT INTO bear_plans (name, type, description, price, duration_days, max_devices, sort_order) VALUES
    ('Free', 'free', 'Plano gratuito com funcionalidades básicas', 0, 0, 1, 0),
    ('Basic', 'basic', 'Plano básico para uso pessoal', 29.90, 30, 2, 1),
    ('Standard', 'standard', 'Plano padrão com mais recursos', 59.90, 30, 3, 2),
    ('Premium', 'premium', 'Plano premium com todos os recursos', 99.90, 30, 5, 3),
    ('Enterprise', 'enterprise', 'Plano empresarial personalizado', 299.90, 30, 50, 4)
ON CONFLICT (name) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bear_plans_type ON bear_plans(type);
CREATE INDEX IF NOT EXISTS idx_bear_plans_is_active ON bear_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_bear_module_permissions_module ON bear_module_permissions(module_id);
CREATE INDEX IF NOT EXISTS idx_bear_module_permissions_plan ON bear_module_permissions(plan_id);

-- ========================================================
-- BEAR Platform - Licenses, Sessions, Devices
-- ========================================================

CREATE TABLE IF NOT EXISTS bear_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID REFERENCES bear_users(id) ON DELETE SET NULL,
    plan_id UUID NOT NULL REFERENCES bear_plans(id),
    status bear_license_status NOT NULL DEFAULT 'trial',
    max_devices INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    last_activated_at TIMESTAMPTZ,
    activated_device_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bear_license_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID NOT NULL REFERENCES bear_licenses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES bear_users(id),
    action VARCHAR(50) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bear_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES bear_users(id) ON DELETE CASCADE,
    license_id UUID REFERENCES bear_licenses(id),
    device_id UUID,
    token_hash VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bear_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES bear_users(id) ON DELETE CASCADE,
    license_id UUID REFERENCES bear_licenses(id) ON DELETE SET NULL,
    device_name VARCHAR(200),
    device_type VARCHAR(50),
    os_name VARCHAR(100),
    os_version VARCHAR(50),
    hardware_id VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bear_subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES bear_users(id) ON DELETE CASCADE,
    license_id UUID REFERENCES bear_licenses(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES bear_plans(id),
    action VARCHAR(50) NOT NULL,
    old_status bear_license_status,
    new_status bear_license_status,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bear_licenses_user ON bear_licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_bear_licenses_code ON bear_licenses(code);
CREATE INDEX IF NOT EXISTS idx_bear_licenses_status ON bear_licenses(status);
CREATE INDEX IF NOT EXISTS idx_bear_licenses_plan ON bear_licenses(plan_id);
CREATE INDEX IF NOT EXISTS idx_bear_license_logs_license ON bear_license_logs(license_id);
CREATE INDEX IF NOT EXISTS idx_bear_sessions_user ON bear_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_bear_sessions_active ON bear_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_bear_devices_user ON bear_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_bear_devices_license ON bear_devices(license_id);
CREATE INDEX IF NOT EXISTS idx_bear_devices_hardware ON bear_devices(hardware_id);
CREATE INDEX IF NOT EXISTS idx_bear_subscription_history_user ON bear_subscription_history(user_id);

-- ========================================================
-- BEAR Platform - Users, Profiles, Roles, Permissions
-- ========================================================

-- Roles table
CREATE TABLE IF NOT EXISTS bear_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name bear_user_role NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Permissions table
CREATE TABLE IF NOT EXISTS bear_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    module VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS bear_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    avatar_url TEXT,
    role bear_user_role NOT NULL DEFAULT 'client',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMPTZ,
    last_ip VARCHAR(45),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS bear_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES bear_users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    company VARCHAR(200),
    country VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    language VARCHAR(10) DEFAULT 'pt-BR',
    bio TEXT,
    website VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles junction table
CREATE TABLE IF NOT EXISTS bear_user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES bear_users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES bear_roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES bear_users(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role_id)
);

-- Seed default roles
INSERT INTO bear_roles (name, description) VALUES
    ('admin', 'Administrador com acesso total'),
    ('moderator', 'Moderador com acesso parcial'),
    ('support', 'Suporte técnico'),
    ('client', 'Cliente padrão')
ON CONFLICT (name) DO NOTHING;

-- Seed default permissions
INSERT INTO bear_permissions (name, description, module) VALUES
    ('users.read', 'Visualizar usuários', 'users'),
    ('users.write', 'Criar/editar usuários', 'users'),
    ('users.delete', 'Remover usuários', 'users'),
    ('licenses.read', 'Visualizar licenças', 'licenses'),
    ('licenses.write', 'Criar/editar licenças', 'licenses'),
    ('licenses.delete', 'Remover licenças', 'licenses'),
    ('plans.read', 'Visualizar planos', 'plans'),
    ('plans.write', 'Criar/editar planos', 'plans'),
    ('versions.read', 'Visualizar versões', 'versions'),
    ('versions.write', 'Publicar versões', 'versions'),
    ('tickets.read', 'Visualizar tickets', 'tickets'),
    ('tickets.write', 'Responder tickets', 'tickets'),
    ('settings.read', 'Visualizar configurações', 'settings'),
    ('settings.write', 'Alterar configurações', 'settings'),
    ('logs.read', 'Visualizar logs', 'logs'),
    ('notifications.write', 'Enviar notificações', 'notifications'),
    ('feature_flags.write', 'Gerenciar feature flags', 'feature_flags'),
    ('remote_configs.write', 'Gerenciar configurações remotas', 'remote_configs'),
    ('downloads.read', 'Visualizar downloads', 'downloads'),
    ('audit.read', 'Visualizar auditoria', 'audit')
ON CONFLICT (name) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bear_users_email ON bear_users(email);
CREATE INDEX IF NOT EXISTS idx_bear_users_role ON bear_users(role);
CREATE INDEX IF NOT EXISTS idx_bear_users_is_active ON bear_users(is_active);
CREATE INDEX IF NOT EXISTS idx_bear_profiles_user_id ON bear_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_bear_user_roles_user_id ON bear_user_roles(user_id);

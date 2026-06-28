-- ========================================================
-- BEAR Platform - Row Level Security Policies
-- ========================================================

-- Enable RLS on all tables
ALTER TABLE bear_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_license_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_remote_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bear_statistics ENABLE ROW LEVEL SECURITY;

-- ========================
-- bear_policy_users
-- ========================

-- Users can read their own profile
CREATE POLICY bear_policy_users_select_own ON bear_users
    FOR SELECT USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY bear_policy_users_select_admin ON bear_users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

-- Admins can insert users
CREATE POLICY bear_policy_users_insert_admin ON bear_users
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
        OR auth.uid() = id
    );

-- Users can update themselves; admins can update all
CREATE POLICY bear_policy_users_update ON bear_users
    FOR UPDATE USING (
        auth.uid() = id
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

-- Only admins can delete
CREATE POLICY bear_policy_users_delete ON bear_users
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

-- Profiles: own or admin
CREATE POLICY bear_policy_profiles_select ON bear_profiles
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY bear_policy_profiles_update ON bear_profiles
    FOR UPDATE USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY bear_policy_profiles_insert ON bear_profiles
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

-- ========================
-- bear_policy_licenses
-- ========================

-- Users see their own licenses
CREATE POLICY bear_policy_licenses_select_own ON bear_licenses
    FOR SELECT USING (user_id = auth.uid());

-- Admins see all
CREATE POLICY bear_policy_licenses_select_admin ON bear_licenses
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

-- Only admins can create/update/delete
CREATE POLICY bear_policy_licenses_insert ON bear_licenses
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

CREATE POLICY bear_policy_licenses_update ON bear_licenses
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

CREATE POLICY bear_policy_licenses_delete ON bear_licenses
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

-- ========================
-- Public read policies
-- ========================

-- Plans (public read)
CREATE POLICY bear_policy_plans_select ON bear_plans
    FOR SELECT USING (true);

CREATE POLICY bear_policy_plans_manage ON bear_plans
    FOR ALL USING (
        EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

-- Versions (published are public)
CREATE POLICY bear_policy_versions_select ON bear_versions
    FOR SELECT USING (
        is_published = true
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY bear_policy_versions_manage ON bear_versions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

-- Downloads (active are available to authenticated)
CREATE POLICY bear_policy_downloads_select ON bear_downloads
    FOR SELECT USING (
        is_active = true
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

-- Feature flags (authenticated read)
CREATE POLICY bear_policy_feature_flags_select ON bear_feature_flags
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY bear_policy_feature_flags_manage ON bear_feature_flags
    FOR ALL USING (
        EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

-- Remote configs (authenticated read)
CREATE POLICY bear_policy_remote_configs_select ON bear_remote_configs
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY bear_policy_remote_configs_manage ON bear_remote_configs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

-- ========================
-- Tickets policies
-- ========================

CREATE POLICY bear_policy_tickets_select ON bear_tickets
    FOR SELECT USING (
        user_id = auth.uid()
        OR assigned_to = auth.uid()
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role IN ('admin', 'support'))
    );

CREATE POLICY bear_policy_tickets_insert ON bear_tickets
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY bear_policy_tickets_update ON bear_tickets
    FOR UPDATE USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role IN ('admin', 'support'))
    );

CREATE POLICY bear_policy_ticket_messages_select ON bear_ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bear_tickets t
            WHERE t.id = ticket_id
            AND (t.user_id = auth.uid() OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role IN ('admin', 'support')))
        )
    );

CREATE POLICY bear_policy_ticket_messages_insert ON bear_ticket_messages
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ========================
-- Notifications policies
-- ========================

CREATE POLICY bear_policy_notifications_select ON bear_notifications
    FOR SELECT USING (
        user_id = auth.uid()
        OR is_global = true
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY bear_policy_notifications_update ON bear_notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY bear_policy_notifications_manage ON bear_notifications
    FOR ALL USING (
        EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

-- Announcements (public read for active)
CREATE POLICY bear_policy_announcements_select ON bear_announcements
    FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY bear_policy_announcements_manage ON bear_announcements
    FOR ALL USING (
        EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

-- ========================
-- Logs policies (admin only)
-- ========================

CREATE POLICY bear_policy_system_logs_select ON bear_system_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY bear_policy_activity_logs_select ON bear_activity_logs
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

-- ========================
-- Other admin-only tables
-- ========================

CREATE POLICY bear_policy_roles_select ON bear_roles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY bear_policy_permissions_select ON bear_permissions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY bear_policy_user_roles_select ON bear_user_roles
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY bear_policy_sessions_select ON bear_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY bear_policy_devices_select ON bear_devices
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY bear_policy_devices_manage ON bear_devices
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY bear_policy_settings_select ON bear_settings
    FOR SELECT USING (
        is_public = true
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY bear_policy_settings_manage ON bear_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY bear_policy_statistics_select ON bear_statistics
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY bear_policy_license_logs_select ON bear_license_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM bear_licenses WHERE id = license_id AND user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY bear_policy_download_logs_select ON bear_download_logs
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY bear_policy_download_logs_insert ON bear_download_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY bear_policy_subscription_history_select ON bear_subscription_history
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY bear_policy_modules_select ON bear_modules
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY bear_policy_module_permissions_select ON bear_module_permissions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY bear_policy_updates_select ON bear_updates
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM bear_users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY bear_policy_updates_insert ON bear_updates
    FOR INSERT WITH CHECK (user_id = auth.uid());

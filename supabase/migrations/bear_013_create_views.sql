-- ========================================================
-- BEAR Platform - Views
-- ========================================================

-- Dashboard summary view
CREATE OR REPLACE VIEW bear_v_dashboard AS
SELECT
    (SELECT COUNT(*) FROM bear_users WHERE is_active = true) AS total_active_users,
    (SELECT COUNT(*) FROM bear_users) AS total_users,
    (SELECT COUNT(*) FROM bear_licenses WHERE status = 'active') AS total_active_licenses,
    (SELECT COUNT(*) FROM bear_licenses) AS total_licenses,
    (SELECT COUNT(*) FROM bear_tickets WHERE status IN ('open', 'in_progress')) AS open_tickets,
    (SELECT COUNT(*) FROM bear_downloads) AS total_downloads,
    (SELECT COALESCE(SUM(download_count), 0) FROM bear_downloads) AS total_download_count,
    (SELECT COUNT(*) FROM bear_versions WHERE is_published = true) AS published_versions,
    (SELECT version FROM bear_versions WHERE is_published = true ORDER BY version_code DESC LIMIT 1) AS latest_version,
    (SELECT COUNT(*) FROM bear_notifications WHERE is_read = false) AS unread_notifications,
    (SELECT COUNT(*) FROM bear_users WHERE created_at >= NOW() - INTERVAL '30 days') AS new_users_30d,
    (SELECT COUNT(*) FROM bear_licenses WHERE created_at >= NOW() - INTERVAL '30 days') AS new_licenses_30d;

-- Active users view
CREATE OR REPLACE VIEW bear_v_active_users AS
SELECT
    u.id,
    u.email,
    u.display_name,
    u.avatar_url,
    u.role,
    u.last_login_at,
    u.last_ip,
    u.created_at,
    p.first_name,
    p.last_name,
    p.phone,
    p.company,
    p.country,
    l.id AS license_id,
    l.code AS license_code,
    l.status AS license_status,
    l.expires_at AS license_expires_at,
    pl.name AS plan_name,
    pl.type AS plan_type
FROM bear_users u
LEFT JOIN bear_profiles p ON p.user_id = u.id
LEFT JOIN bear_licenses l ON l.user_id = u.id AND l.status = 'active'
LEFT JOIN bear_plans pl ON pl.id = l.plan_id
WHERE u.is_active = true;

-- Active licenses view
CREATE OR REPLACE VIEW bear_v_active_licenses AS
SELECT
    l.id,
    l.code,
    l.status,
    l.max_devices,
    l.activated_device_count,
    l.last_activated_at,
    l.expires_at,
    l.notes,
    l.created_at,
    u.id AS user_id,
    u.email AS user_email,
    u.display_name AS user_display_name,
    p.name AS plan_name,
    p.type AS plan_type,
    p.price AS plan_price,
    p.duration_days AS plan_duration,
    CASE
        WHEN l.expires_at IS NULL THEN false
        WHEN l.expires_at <= NOW() THEN true
        ELSE false
    END AS is_expired,
    CASE
        WHEN l.expires_at IS NULL THEN NULL
        WHEN l.expires_at > NOW() THEN EXTRACT(DAY FROM l.expires_at - NOW())
        ELSE 0
    END AS days_remaining
FROM bear_licenses l
JOIN bear_users u ON u.id = l.user_id
JOIN bear_plans p ON p.id = l.plan_id
WHERE l.status = 'active';

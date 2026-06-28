-- ========================================================
-- BEAR Platform - Functions
-- ========================================================

-- Validate license function
CREATE OR REPLACE FUNCTION bear_fn_validate_license(
    p_license_code VARCHAR,
    p_hardware_id VARCHAR DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_license RECORD;
    v_result JSONB;
BEGIN
    -- Find the license
    SELECT l.*, p.name AS plan_name, p.type AS plan_type, p.features AS plan_features
    INTO v_license
    FROM bear_licenses l
    JOIN bear_plans p ON p.id = l.plan_id
    WHERE l.code = p_license_code;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'error', 'LICENSE_NOT_FOUND', 'message', 'Licença não encontrada');
    END IF;

    -- Check if license is active
    IF v_license.status != 'active' AND v_license.status != 'trial' THEN
        RETURN jsonb_build_object('valid', false, 'error', 'LICENSE_INACTIVE', 'message', 'Licença inativa: ' || v_license.status, 'status', v_license.status::text);
    END IF;

    -- Check expiration
    IF v_license.expires_at IS NOT NULL AND v_license.expires_at < NOW() THEN
        -- Update license status to expired
        UPDATE bear_licenses SET status = 'expired', updated_at = NOW() WHERE id = v_license.id;
        RETURN jsonb_build_object('valid', false, 'error', 'LICENSE_EXPIRED', 'message', 'Licença expirada');
    END IF;

    -- Check user ownership (if user_id is provided)
    IF p_user_id IS NOT NULL AND v_license.user_id IS NOT NULL AND v_license.user_id != p_user_id THEN
        RETURN jsonb_build_object('valid', false, 'error', 'LICENSE_WRONG_USER', 'message', 'Licença pertence a outro usuário');
    END IF;

    -- Check device limit
    IF p_hardware_id IS NOT NULL THEN
        DECLARE
            v_device_exists BOOLEAN;
            v_device_count INTEGER;
        BEGIN
            SELECT EXISTS(
                SELECT 1 FROM bear_devices WHERE license_id = v_license.id AND hardware_id = p_hardware_id AND is_active = true
            ) INTO v_device_exists;

            IF NOT v_device_exists THEN
                SELECT COUNT(*) INTO v_device_count FROM bear_devices WHERE license_id = v_license.id AND is_active = true;
                IF v_device_count >= v_license.max_devices THEN
                    RETURN jsonb_build_object('valid', false, 'error', 'MAX_DEVICES_REACHED', 'message', 'Limite de dispositivos atingido', 'max_devices', v_license.max_devices, 'current_devices', v_device_count);
                END IF;
            END IF;
        END;
    END IF;

    -- Update last activated
    UPDATE bear_licenses SET last_activated_at = NOW(), updated_at = NOW() WHERE id = v_license.id;

    -- Build success result
    v_result := jsonb_build_object(
        'valid', true,
        'license_id', v_license.id,
        'code', v_license.code,
        'status', v_license.status::text,
        'plan_name', v_license.plan_name,
        'plan_type', v_license.plan_type::text,
        'plan_features', v_license.plan_features,
        'max_devices', v_license.max_devices,
        'expires_at', v_license.expires_at,
        'days_remaining', CASE
            WHEN v_license.expires_at IS NULL THEN NULL
            ELSE EXTRACT(DAY FROM v_license.expires_at - NOW())
        END
    );

    RETURN v_result;
END;
$$;

-- Check updates function
CREATE OR REPLACE FUNCTION bear_fn_check_updates(
    p_current_version VARCHAR,
    p_current_version_code INTEGER DEFAULT 0,
    p_plan_type bear_plan_type DEFAULT 'free'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_latest RECORD;
    v_has_update BOOLEAN := false;
BEGIN
    -- Find the latest published version available for the user's plan
    SELECT *
    INTO v_latest
    FROM bear_versions
    WHERE is_published = true
      AND (min_plan IS NULL OR min_plan <= p_plan_type)
    ORDER BY version_code DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('has_update', false, 'message', 'Nenhuma versão disponível');
    END IF;

    v_has_update := v_latest.version_code > p_current_version_code;

    RETURN jsonb_build_object(
        'has_update', v_has_update,
        'current_version', p_current_version,
        'latest_version', v_latest.version,
        'latest_version_code', v_latest.version_code,
        'title', v_latest.title,
        'description', v_latest.description,
        'changelog', v_latest.changelog,
        'download_url', v_latest.download_url,
        'file_size', v_latest.file_size,
        'file_hash', v_latest.file_hash,
        'is_mandatory', v_latest.is_mandatory,
        'published_at', v_latest.published_at
    );
END;
$$;

-- Log activity function
CREATE OR REPLACE FUNCTION bear_fn_log_activity(
    p_user_id UUID,
    p_action bear_log_action,
    p_resource_type VARCHAR DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address VARCHAR DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO bear_activity_logs (
        user_id, action, resource_type, resource_id, description,
        old_values, new_values, ip_address, user_agent, metadata
    ) VALUES (
        p_user_id, p_action, p_resource_type, p_resource_id, p_description,
        p_old_values, p_new_values, p_ip_address, p_user_agent, p_metadata
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;

// Bear License Edge Function
// Handles license validation, activation, and management

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...payload } = await req.json();

    switch (action) {
      case "validate": {
        const { license_code, hardware_id, user_id } = payload;

        const { data, error } = await supabase.rpc("bear_fn_validate_license", {
          p_license_code: license_code,
          p_hardware_id: hardware_id || null,
          p_user_id: user_id || null,
        });

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "activate": {
        const { license_code, user_id, device_name, os_name, os_version, hardware_id } = payload;

        // Validate first
        const { data: validation } = await supabase.rpc("bear_fn_validate_license", {
          p_license_code: license_code,
          p_hardware_id: hardware_id,
          p_user_id: user_id,
        });

        if (!validation?.valid) {
          return new Response(JSON.stringify(validation), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Register device
        const { data: existingDevice } = await supabase
          .from("bear_devices")
          .select("id")
          .eq("hardware_id", hardware_id)
          .eq("license_id", validation.license_id)
          .single();

        if (!existingDevice) {
          await supabase.from("bear_devices").insert({
            user_id,
            license_id: validation.license_id,
            device_name,
            os_name,
            os_version,
            hardware_id,
          });

          // Update device count
          await supabase
            .from("bear_licenses")
            .update({
              activated_device_count: (validation.max_devices || 0) + 1,
              last_activated_at: new Date().toISOString(),
            })
            .eq("id", validation.license_id);
        } else {
          await supabase
            .from("bear_devices")
            .update({ last_seen_at: new Date().toISOString() })
            .eq("id", existingDevice.id);
        }

        // Log activation
        await supabase.from("bear_license_logs").insert({
          license_id: validation.license_id,
          user_id,
          action: "activation",
          details: { device_name, hardware_id, os_name },
        });

        return new Response(
          JSON.stringify({ success: true, license: validation }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "generate": {
        const { plan_id, user_id, notes, duration_days } = payload;

        // Generate license code
        const code = `BEAR-${generateCode(4)}-${generateCode(4)}-${generateCode(4)}`;

        const { data: plan } = await supabase
          .from("bear_plans")
          .select("*")
          .eq("id", plan_id)
          .single();

        if (!plan) {
          return new Response(JSON.stringify({ error: "Plan not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const expiresAt = duration_days
          ? new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString()
          : plan.duration_days > 0
          ? new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString()
          : null;

        const { data: license, error } = await supabase
          .from("bear_licenses")
          .insert({
            code,
            user_id: user_id || null,
            plan_id,
            status: "active",
            max_devices: plan.max_devices,
            notes,
            expires_at: expiresAt,
          })
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true, license }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateCode(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

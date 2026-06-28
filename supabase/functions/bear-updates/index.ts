// Bear Updates Edge Function
// Handles OTA update checks and version management

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
      case "check": {
        const { current_version, current_version_code, plan_type } = payload;

        const { data, error } = await supabase.rpc("bear_fn_check_updates", {
          p_current_version: current_version || "0.0.0",
          p_current_version_code: current_version_code || 0,
          p_plan_type: plan_type || "free",
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

      case "publish": {
        const { version, version_code, title, description, changelog, download_url, file_size, file_hash, is_mandatory, min_plan, published_by } = payload;

        const { data, error } = await supabase
          .from("bear_versions")
          .insert({
            version,
            version_code,
            title,
            description,
            changelog,
            download_url,
            file_size,
            file_hash,
            is_mandatory: is_mandatory || false,
            is_published: true,
            published_at: new Date().toISOString(),
            published_by,
            min_plan: min_plan || "free",
          })
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true, version: data }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "log_update": {
        const { version_id, user_id, from_version, to_version, status } = payload;

        await supabase.from("bear_updates").insert({
          version_id,
          user_id,
          from_version,
          to_version,
          status: status || "completed",
          completed_at: new Date().toISOString(),
        });

        return new Response(JSON.stringify({ success: true }), {
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

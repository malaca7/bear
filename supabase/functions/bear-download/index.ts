// Bear Download Edge Function
// Handles download tracking and file serving

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
      case "get_latest": {
        const { plan_type } = payload;

        const { data: version } = await supabase
          .from("bear_versions")
          .select("*")
          .eq("is_published", true)
          .order("version_code", { ascending: false })
          .limit(1)
          .single();

        if (!version) {
          return new Response(JSON.stringify({ error: "No version available" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: downloads } = await supabase
          .from("bear_downloads")
          .select("*")
          .eq("version_id", version.id)
          .eq("is_active", true);

        return new Response(
          JSON.stringify({ version, downloads: downloads || [] }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "log": {
        const { download_id, user_id, version_id, ip_address, user_agent, device_info } = payload;

        // Log the download
        await supabase.from("bear_download_logs").insert({
          download_id,
          user_id,
          version_id,
          ip_address,
          user_agent,
          device_info: device_info || {},
        });

        // Increment download count
        await supabase.rpc("bear_fn_log_activity", {
          p_user_id: user_id,
          p_action: "download",
          p_resource_type: "download",
          p_resource_id: download_id,
          p_description: "Download realizado",
          p_ip_address: ip_address,
        });

        // Increment counter
        const { data: dl } = await supabase
          .from("bear_downloads")
          .select("download_count")
          .eq("id", download_id)
          .single();

        if (dl) {
          await supabase
            .from("bear_downloads")
            .update({ download_count: (dl.download_count || 0) + 1 })
            .eq("id", download_id);
        }

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

// Bear Notification Edge Function
// Handles notification creation and management

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
      case "send": {
        const { title, message, type, user_ids, is_global, action_url, expires_at } = payload;

        if (is_global) {
          await supabase.from("bear_notifications").insert({
            title,
            message,
            type: type || "info",
            is_global: true,
            action_url,
            expires_at,
          });
        } else if (user_ids && user_ids.length > 0) {
          const notifications = user_ids.map((uid: string) => ({
            user_id: uid,
            title,
            message,
            type: type || "info",
            is_global: false,
            action_url,
            expires_at,
          }));

          await supabase.from("bear_notifications").insert(notifications);
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "send_to_plan": {
        const { title, message, type, plan_type, action_url } = payload;

        // Get users with specific plan
        const { data: licenses } = await supabase
          .from("bear_licenses")
          .select("user_id, bear_plans!inner(type)")
          .eq("status", "active")
          .eq("bear_plans.type", plan_type);

        if (licenses && licenses.length > 0) {
          const userIds = [...new Set(licenses.map((l: any) => l.user_id))];
          const notifications = userIds.map((uid: string) => ({
            user_id: uid,
            title,
            message,
            type: type || "info",
            action_url,
          }));

          await supabase.from("bear_notifications").insert(notifications);
        }

        return new Response(
          JSON.stringify({ success: true, sent_to: licenses?.length || 0 }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "mark_read": {
        const { notification_ids, user_id } = payload;

        await supabase
          .from("bear_notifications")
          .update({ is_read: true })
          .in("id", notification_ids)
          .eq("user_id", user_id);

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_unread_count": {
        const { user_id } = payload;

        const { count } = await supabase
          .from("bear_notifications")
          .select("*", { count: "exact", head: true })
          .eq("is_read", false)
          .or(`user_id.eq.${user_id},is_global.eq.true`);

        return new Response(JSON.stringify({ count: count || 0 }), {
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

// Bear Auth Edge Function
// Handles authentication flows and user management

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
      case "register": {
        const { email, password, display_name } = payload;

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: false,
        });

        if (authError) {
          return new Response(JSON.stringify({ error: authError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Create bear_users entry
        const { error: userError } = await supabase.from("bear_users").insert({
          id: authData.user.id,
          email,
          display_name: display_name || email.split("@")[0],
          role: "client",
        });

        if (userError) {
          // Cleanup on failure
          await supabase.auth.admin.deleteUser(authData.user.id);
          return new Response(JSON.stringify({ error: userError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Create profile
        await supabase.from("bear_profiles").insert({
          user_id: authData.user.id,
        });

        // Log activity
        await supabase.rpc("bear_fn_log_activity", {
          p_user_id: authData.user.id,
          p_action: "login",
          p_resource_type: "user",
          p_resource_id: authData.user.id,
          p_description: "Novo registro de usuário",
        });

        return new Response(
          JSON.stringify({ success: true, user_id: authData.user.id }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "get_profile": {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
          return new Response(JSON.stringify({ error: "Invalid token" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: bearUser } = await supabase
          .from("bear_users")
          .select("*, bear_profiles(*)")
          .eq("id", user.id)
          .single();

        const { data: license } = await supabase
          .from("bear_licenses")
          .select("*, bear_plans(*)")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single();

        return new Response(
          JSON.stringify({ user: bearUser, license }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "update_last_login": {
        const { user_id, ip_address } = payload;
        await supabase
          .from("bear_users")
          .update({ last_login_at: new Date().toISOString(), last_ip: ip_address })
          .eq("id", user_id);

        await supabase.rpc("bear_fn_log_activity", {
          p_user_id: user_id,
          p_action: "login",
          p_description: "Login realizado",
          p_ip_address: ip_address,
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

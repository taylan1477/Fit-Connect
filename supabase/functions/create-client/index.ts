import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    // 1. Service Role Client (Yetkili işlemler için)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 2. İsteği Yapan Kullanıcının Token'ını Doğrula
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseCaller = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: callerUser }, error: callerError } = await supabaseCaller.auth.getUser();
    if (callerError || !callerUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // 3. RBAC Kontrolü: İsteği yapan kişi 'trainer' mı?
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", callerUser.id)
      .single();

    if (profileError || callerProfile?.role !== "trainer") {
      return new Response(
        JSON.stringify({ error: "Forbidden: Sadece antrenörler danışan hesabı oluşturabilir." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // 4. İstek Gövdesini Doğrula
    const body = await req.json();
    const { email, password, full_name, phone } = body;

    if (!email || !password || !full_name) {
      return new Response(
        JSON.stringify({ error: "E-posta, şifre ve ad soyad alanları zorunludur." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 5. Admin API ile Kullanıcı Oluştur (Oturum düşürmez)
    const { data: newAuthData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: "client",
        trainer_id: callerUser.id,
        phone: phone || null,
        must_change_password: true,
      },
    });

    if (createError) {
      return new Response(
        JSON.stringify({
          error: createError.message.includes("already registered")
            ? "Bu e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut."
            : createError.message,
          code: createError.name,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    return new Response(JSON.stringify({ user: newAuthData.user }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Bilinmeyen sunucu hatası" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const json = (status:number, body:unknown) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  },
});

Deno.serve(async (req:Request) => {
  if (req.method === "OPTIONS") return json(200, { ok: true });
  if (req.method !== "POST") return json(405, { message: "Method not allowed" });

  try {
    const body = await req.json().catch(() => ({}));
    const identifier = String(body?.identifier || "").trim().toLowerCase();
    const password = String(body?.password || "");
    if (!identifier || !password) return json(400, { message: "Thiếu tài khoản hoặc mật khẩu" });

    let email = identifier;

    if (!identifier.includes("@")) {
      const url = new URL(SUPABASE_URL + "/rest/v1/profiles");
      url.searchParams.set("select", "email,active");
      url.searchParams.set("username", "eq." + identifier);
      url.searchParams.set("limit", "1");

      const profileRes = await fetch(url.toString(), {
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: "Bearer " + SERVICE_ROLE,
          "Content-Type": "application/json",
        },
      });

      if (!profileRes.ok) return json(401, { message: "Tài khoản hoặc mật khẩu chưa đúng" });
      const rows = await profileRes.json();
      const profile = Array.isArray(rows) ? rows[0] : null;
      if (!profile?.email || profile.active === false) {
        return json(401, { message: "Tài khoản hoặc mật khẩu chưa đúng" });
      }
      email = String(profile.email).trim().toLowerCase();
    }

    const authRes = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: {
        apikey: ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const authData = await authRes.json().catch(() => ({}));
    if (!authRes.ok) return json(401, { message: "Tài khoản hoặc mật khẩu chưa đúng" });

    return json(200, authData);
  } catch (_err) {
    return json(500, { message: "Không thể kết nối hệ thống đăng nhập" });
  }
});
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });

    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "Unauthorized" }, 401);

    const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const { data: caller } = await admin.from("profiles")
      .select("id,is_admin,active")
      .eq("id", userData.user.id)
      .single();
    if (!caller?.is_admin || caller.active === false) return json({ error: "Forbidden" }, 403);

    const body = await req.json();
    const action = body.action || "list";

    if (action === "list") {
      const { data: profiles, error } = await admin.from("profiles")
        .select("id,email,username,display_name,is_admin,active,created_at,deleted_at")
        .is("deleted_at", null)
        .order("is_admin", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: memberships } = await admin.from("building_members")
        .select("user_id,building_id,role,buildings(id,name,deleted_at)");
      const map = new Map<string, any[]>();
      for (const m of memberships || []) {
        const b = (m as any).buildings;
        if (!b || b.deleted_at) continue;
        const arr = map.get(m.user_id) || [];
        arr.push({ id: m.building_id, name: b.name || m.building_id, role: m.role });
        map.set(m.user_id, arr);
      }
      return json({ users: (profiles || []).map(p => ({ ...p, buildings: map.get(p.id) || [] })) });
    }

    if (action === "list_buildings") {
      const { data, error } = await admin.from("buildings")
        .select("id,name,deleted_at")
        .is("deleted_at", null)
        .order("name");
      if (error) throw error;
      return json({ buildings: data || [] });
    }

    if (action === "list_deleted_buildings") {
      const { data, error } = await admin.from("buildings")
        .select("id,name,deleted_at")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });
      if (error) throw error;
      return json({ buildings: data || [] });
    }

    if (action === "create_building") {
      const id = String(body.id || "").trim().toUpperCase();
      const name = String(body.name || "").trim();
      if (!/^[A-Z0-9._-]{2,20}$/.test(id)) return json({ error: "Mã dự án từ 2-20 ký tự, không có khoảng trắng." }, 400);
      if (name.length < 3 || name.length > 120) return json({ error: "Tên dự án phải từ 3 đến 120 ký tự." }, 400);

      const { data: exists } = await admin.from("buildings").select("id,deleted_at").eq("id", id).maybeSingle();
      if (exists?.deleted_at) return json({ error: "Mã dự án này đang nằm trong Thùng rác. Hãy khôi phục dự án." }, 400);
      if (exists) return json({ error: "Mã dự án đã tồn tại." }, 400);

      const { error } = await admin.from("buildings").insert({ id, name, deleted_at: null });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, building: { id, name } });
    }

    if (action === "delete_building") {
      const id = String(body.id || "").trim();
      const confirmName = String(body.confirm_name || "").trim();
      const { data: building, error: getErr } = await admin.from("buildings")
        .select("id,name,deleted_at").eq("id", id).single();
      if (getErr || !building) return json({ error: "Không tìm thấy dự án." }, 404);
      if (building.deleted_at) return json({ error: "Dự án đã nằm trong Thùng rác." }, 400);
      if (confirmName !== building.name) return json({ error: "Tên xác nhận dự án không đúng." }, 400);

      const { error } = await admin.from("buildings").update({ deleted_at: new Date().toISOString() }).eq("id", id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, building: { id: building.id, name: building.name } });
    }

    if (action === "restore_building") {
      const id = String(body.id || "").trim();
      const { data: building, error: getErr } = await admin.from("buildings")
        .select("id,name,deleted_at").eq("id", id).single();
      if (getErr || !building) return json({ error: "Không tìm thấy dự án trong Thùng rác." }, 404);
      if (!building.deleted_at) return json({ error: "Dự án này đang hoạt động." }, 400);
      const { error } = await admin.from("buildings").update({ deleted_at: null }).eq("id", id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, building: { id: building.id, name: building.name } });
    }

    if (action === "create") {
      const username = String(body.username || "").trim().toLowerCase();
      const password = String(body.password || "");
      const displayName = String(body.display_name || username).trim();
      const buildingIds = Array.isArray(body.building_ids) ? body.building_ids.map(String) : [];
      const role = body.role === "viewer" ? "viewer" : "editor";
      if (!/^[a-z0-9._-]{3,40}$/.test(username)) return json({ error: "Tên đăng nhập chỉ dùng chữ thường, số, dấu chấm, gạch ngang hoặc gạch dưới." }, 400);
      if (password.length < 6) return json({ error: "Mật khẩu phải có ít nhất 6 ký tự." }, 400);
      if (!buildingIds.length) return json({ error: "Hãy chọn ít nhất một dự án." }, 400);

      const { count } = await admin.from("buildings").select("*", { count: "exact", head: true })
        .in("id", buildingIds).is("deleted_at", null);
      if ((count || 0) !== buildingIds.length) return json({ error: "Có dự án không tồn tại hoặc đang nằm trong Thùng rác." }, 400);

      const email = username + "@esta-building.app";
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { username, display_name: displayName }
      });
      if (createErr) return json({ error: createErr.message }, 400);
      const uid = created.user.id;

      await admin.from("profiles").update({ username, display_name: displayName, active: true }).eq("id", uid);
      const rows = buildingIds.map((building_id: string) => ({ user_id: uid, building_id, role }));
      const { error: memberErr } = await admin.from("building_members").insert(rows);
      if (memberErr) {
        await admin.auth.admin.deleteUser(uid);
        return json({ error: memberErr.message }, 400);
      }
      return json({ ok: true, user_id: uid });
    }

    if (action === "delete_user") {
      const userId = String(body.user_id || "");
      const { data: target, error: targetErr } = await admin.from("profiles")
        .select("id,is_admin,display_name,username").eq("id", userId).single();
      if (targetErr || !target) return json({ error: "Không tìm thấy tài khoản." }, 404);
      if (target.is_admin) return json({ error: "Không thể xóa tài khoản Admin chính." }, 400);

      await admin.from("building_members").delete().eq("user_id", userId);
      const deletedEmail = "deleted-" + userId + "@esta-building.app";
      const { error: authErr } = await admin.auth.admin.updateUserById(userId, {
        email: deletedEmail,
        password: crypto.randomUUID() + crypto.randomUUID()
      });
      if (authErr) return json({ error: authErr.message }, 400);

      const { error: profileErr } = await admin.from("profiles").update({
        username: null,
        email: deletedEmail,
        active: false,
        deleted_at: new Date().toISOString()
      }).eq("id", userId);
      if (profileErr) return json({ error: profileErr.message }, 400);
      return json({ ok: true });
    }

    if (action === "reset_password") {
      const userId = String(body.user_id || "");
      const password = String(body.password || "");
      if (password.length < 6) return json({ error: "Mật khẩu phải có ít nhất 6 ký tự." }, 400);
      const { error } = await admin.auth.admin.updateUserById(userId, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "set_active") {
      const userId = String(body.user_id || "");
      const active = Boolean(body.active);
      const { data: target } = await admin.from("profiles").select("is_admin").eq("id", userId).single();
      if (target?.is_admin) return json({ error: "Không thể khóa tài khoản Admin chính." }, 400);
      const { error } = await admin.from("profiles").update({ active }).eq("id", userId);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "set_buildings") {
      const userId = String(body.user_id || "");
      const buildingIds = Array.isArray(body.building_ids) ? body.building_ids.map(String) : [];
      const role = body.role === "viewer" ? "viewer" : "editor";
      await admin.from("building_members").delete().eq("user_id", userId);
      if (buildingIds.length) {
        const { error } = await admin.from("building_members")
          .insert(buildingIds.map((building_id: string) => ({ user_id: userId, building_id, role })));
        if (error) return json({ error: error.message }, 400);
      }
      return json({ ok: true });
    }

    return json({ error: "Action không hợp lệ" }, 400);
  } catch (e) {
    return json({ error: (e as Error)?.message || "Server error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" }
  });
}

"use strict";
/**
 * ESTA private-media gateway. Supabase owns user/project permissions and
 * task data. Backblaze B2 holds only new photo bytes when enabled.
 * Never place B2 application keys in frontend files or Git.
 */
const crypto = require("node:crypto");

const SUPABASE_URL = "https://upcjcrycahdfroxggsdz.supabase.co";
const SUPABASE_KEY = "sb_publishable_WQiZyrTXCeRr6BgfXAtQSg_zX_eUBsa";
const MAX_UPLOAD_BYTES = 3_500_000; // below Vercel's 4.5 MB request limit
const MAX_IMAGE_BYTES = 4_200_000; // below Vercel's 4.5 MB response limit
const VALID_KIND = new Set(["tasks", "energy", "incident-before", "incident-after", "maintenance-before", "maintenance-after"]);

function getConfig() {
  const region = String(process.env.ESTA_B2_REGION || "").trim();
  const bucket = String(process.env.ESTA_B2_BUCKET || "").trim();
  const accessKey = String(process.env.ESTA_B2_KEY_ID || "").trim();
  const secretKey = String(process.env.ESTA_B2_APPLICATION_KEY || "");
  const enabled = process.env.ESTA_B2_ENABLED === "true" &&
    /^[a-z]{2}-[a-z]+-\d{3}$/.test(region) &&
    /^[a-z0-9-]{6,63}$/.test(bucket) &&
    !!accessKey && !!secretKey;
  return { enabled, region, bucket, accessKey, secretKey };
}
function encodedBuilding(id) {
  return "b-" + Buffer.from(String(id), "utf8").toString("hex");
}
function parseObjectPath(path) {
  if (typeof path !== "string" || path.length > 512) return null;
  const m = /^b-([0-9a-f]{2,160})\/(tasks|energy|incident-before|incident-after|maintenance-before|maintenance-after)\/([A-Za-z0-9_-]{1,70})\/([A-Za-z0-9-]{1,120})\.jpg$/.exec(path);
  if (!m || m[1].length % 2) return null;
  const buildingId = Buffer.from(m[1], "hex").toString("utf8");
  if (!buildingId || encodedBuilding(buildingId) !== "b-" + m[1]) return null;
  return { buildingId, kind:m[2], path };
}
function hmac(key, value) {
  return crypto.createHmac("sha256", key).update(value).digest();
}
function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
function b2SignedRequest(cfg, method, path, body) {
  const host = "s3." + cfg.region + ".backblazeb2.com";
  const canonicalUri = "/" + [cfg.bucket, ...path.split("/")].map(encodeURIComponent).join("/");
  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = timestamp.slice(0, 8);
  const digest = sha256(body || Buffer.alloc(0));
  const headers = { "x-amz-date": timestamp, "x-amz-content-sha256": digest };
  const canonicalHeaders = "host:" + host + "\n" +
    "x-amz-content-sha256:" + digest + "\n" +
    "x-amz-date:" + timestamp + "\n";
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [method, canonicalUri, "", canonicalHeaders, signedHeaders, digest].join("\n");
  const scope = date + "/" + cfg.region + "/s3/aws4_request";
  const stringToSign = [
    "AWS4-HMAC-SHA256", timestamp, scope, sha256(canonicalRequest)
  ].join("\n");
  const signingKey = hmac(hmac(hmac(hmac("AWS4" + cfg.secretKey, date), cfg.region), "s3"), "aws4_request");
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  headers.Authorization = "AWS4-HMAC-SHA256 Credential=" + cfg.accessKey + "/" + scope +
    ", SignedHeaders=" + signedHeaders + ", Signature=" + signature;
  if (method === "PUT") headers["Content-Type"] = "image/jpeg";
  return {
    url: "https://" + host + canonicalUri,
    options: { method, headers, ...(body ? { body } : {}) }
  };
}
async function supabaseGet(path, token) {
  const res = await fetch(SUPABASE_URL + path, {
    headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + token },
    signal: AbortSignal.timeout(9000)
  });
  if (!res.ok) return null;
  return res.json();
}
async function userCanAccess(token, buildingId, write) {
  const user = await supabaseGet("/auth/v1/user", token);
  if (!user?.id) return false;
  const profiles = await supabaseGet(
    "/rest/v1/profiles?select=id,is_admin,active&id=eq." + encodeURIComponent(user.id), token
  );
  const profile = Array.isArray(profiles) ? profiles[0] : null;
  if (!profile || profile.active === false) return false;
  const buildings = await supabaseGet(
    "/rest/v1/buildings?select=id&id=eq." + encodeURIComponent(buildingId) + "&deleted_at=is.null", token
  );
  if (!Array.isArray(buildings) || !buildings.length) return false;
  if (profile.is_admin) return true;
  const memberships = await supabaseGet(
    "/rest/v1/building_members?select=role&building_id=eq." + encodeURIComponent(buildingId) +
    "&user_id=eq." + encodeURIComponent(user.id), token
  );
  return Array.isArray(memberships) && memberships.some(row => !write || row.role !== "viewer");
}
function respond(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}
async function readPhotoBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body, "binary");
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_UPLOAD_BYTES) throw Object.assign(new Error("Ảnh lớn hơn 3,5 MB"), { status:413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
module.exports = async function handler(req, res) {
  try {
    const cfg = getConfig();
    const url = new URL(req.url, "https://esta.local");
    if (req.method === "GET" && url.searchParams.get("status") === "1") {
      return respond(res, 200, { enabled: cfg.enabled, provider: cfg.enabled ? "b2" : "supabase" });
    }
    if (!cfg.enabled) return respond(res, 503, { error:"Chưa cấu hình kho Backblaze B2." });
    const token = /^Bearer (.+)$/i.exec(String(req.headers.authorization || ""))?.[1] || "";
    if (!token) return respond(res, 401, { error:"Vui lòng đăng nhập ESTA." });
    if (req.method === "POST") {
      const buildingId = url.searchParams.get("buildingId") || "";
      const kind = url.searchParams.get("kind") || "";
      const recordId = url.searchParams.get("recordId") || "";
      if (!buildingId || buildingId.length > 80 || !VALID_KIND.has(kind) ||
          !/^[A-Za-z0-9_-]{1,70}$/.test(recordId)) {
        return respond(res, 400, { error:"Thông tin ảnh hoặc dự án không hợp lệ." });
      }
      if (!await userCanAccess(token, buildingId, true)) {
        return respond(res, 403, { error:"Không có quyền tải ảnh vào dự án." });
      }
      if (!/^image\/jpeg(?:\s*;|$)/i.test(String(req.headers["content-type"] || ""))) {
        return respond(res, 415, { error:"Chỉ nhận hình JPEG đã nén." });
      }
      if (Number(req.headers["content-length"] || 0) > MAX_UPLOAD_BYTES) {
        return respond(res, 413, { error:"Ảnh lớn hơn 3,5 MB." });
      }
      const body = await readPhotoBody(req);
      if (!body.length || body.length > MAX_UPLOAD_BYTES ||
          body[0] !== 0xff || body[1] !== 0xd8) {
        return respond(res, 400, { error:"Ảnh JPEG trống, không hợp lệ hoặc quá lớn." });
      }
      const path = encodedBuilding(buildingId) + "/" + kind + "/" + recordId + "/" +
        Date.now() + "-" + crypto.randomUUID() + ".jpg";
      const request = b2SignedRequest(cfg, "PUT", path, body);
      const upstream = await fetch(request.url, { ...request.options, signal:AbortSignal.timeout(25000) });
      if (!upstream.ok) return respond(res, 502, { error:"Backblaze từ chối lưu ảnh (HTTP " + upstream.status + ")." });
      return respond(res, 201, { ref:"b2:" + path });
    }
    const object = parseObjectPath(url.searchParams.get("path"));
    if (!object) return respond(res, 400, { error:"Đường dẫn ảnh không hợp lệ." });
    if (req.method !== "GET" && req.method !== "DELETE") {
      return respond(res, 405, { error:"Phương thức không được hỗ trợ." });
    }
    if (!await userCanAccess(token, object.buildingId, req.method === "DELETE")) {
      return respond(res, 403, { error:"Không có quyền truy cập ảnh của dự án." });
    }
    const request = b2SignedRequest(cfg, req.method, object.path);
    const upstream = await fetch(request.url, { ...request.options, signal:AbortSignal.timeout(25000) });
    if (req.method === "DELETE") {
      if (!upstream.ok && upstream.status !== 404) return respond(res, 502, {error:"Không thể xóa ảnh B2."});
      return respond(res, 200, { deleted:true });
    }
    if (!upstream.ok) return respond(res, upstream.status === 404 ? 404 : 502, {error:"Không thể đọc hình ảnh B2."});
    const size = Number(upstream.headers.get("content-length") || 0);
    if (size > MAX_IMAGE_BYTES) return respond(res, 413, {error:"Ảnh vượt giới hạn tải."});
    const bytes = Buffer.from(await upstream.arrayBuffer());
    if (bytes.length > MAX_IMAGE_BYTES) return respond(res, 413, {error:"Ảnh vượt giới hạn tải."});
    res.statusCode = 200;
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.end(bytes);
  } catch (err) {
    console.error("ESTA media gateway:", err?.message);
    respond(res, err?.status || 502, { error: err?.status ? err.message : "Kho ảnh tạm thời không phản hồi." });
  }
};

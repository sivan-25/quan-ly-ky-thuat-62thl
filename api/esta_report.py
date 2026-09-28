# -*- coding: utf-8 -*-
import base64
import json
import os
import tempfile
import traceback
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler

from esta_report_template import build_doc, story_merged

SB_URL = "https://upcjcrycahdfroxggsdz.supabase.co"
SB_KEY = "sb_publishable_WQiZyrTXCeRr6BgfXAtQSg_zX_eUBsa"
MEDIA_BUCKET = "task-images"
OUTPUT_NAME = "ESTA_BaoCao_KyThuat_TongHop_ChiTiet.pdf"

def _json_bytes(obj):
    return json.dumps(obj, ensure_ascii=False).encode("utf-8")

def _validate_token(token):
    if not token:
        raise PermissionError("Thiếu phiên đăng nhập")
    req = urllib.request.Request(
        SB_URL + "/auth/v1/user",
        headers={"apikey": SB_KEY, "Authorization": "Bearer " + token},
    )
    with urllib.request.urlopen(req, timeout=12) as resp:
        if resp.status != 200:
            raise PermissionError("Phiên đăng nhập không hợp lệ")
        return json.loads(resp.read().decode("utf-8"))

def _download_image(source, token):
    if not source:
        return None, ".jpg"
    if source.startswith("data:image/"):
        head, encoded = source.split(",", 1)
        ext = ".png" if "png" in head.lower() else ".jpg"
        return base64.b64decode(encoded), ext

    headers = {"User-Agent": "ESTA-Report-Generator/1.0"}
    url = source
    if source.startswith("storage:"):
        path = source[8:]
        url = (
            SB_URL
            + "/storage/v1/object/authenticated/"
            + MEDIA_BUCKET
            + "/"
            + urllib.parse.quote(path, safe="/")
        )
        headers["apikey"] = SB_KEY
        headers["Authorization"] = "Bearer " + token
    elif not (source.startswith("https://") or source.startswith("http://")):
        return None, ".jpg"

    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=22) as resp:
        raw = resp.read()
        ctype = (resp.headers.get("Content-Type") or "").lower()
    ext = ".png" if "png" in ctype else ".jpg"
    return raw, ext

def _prepare_data(payload, token, temp_dir):
    data = {
        "building": str(payload.get("building") or "[CẦN BỔ SUNG]"),
        "report_date": str(payload.get("report_date") or ""),
        "prepared_by": str(payload.get("prepared_by") or ""),
        "images_per_row": 2 if int(payload.get("images_per_row") or 1) == 2 else 1,
        "tasks": [],
    }
    img_dir = os.path.join(temp_dir, "images")
    os.makedirs(img_dir, exist_ok=True)
    missing_images = 0

    tasks = payload.get("tasks") or []
    if not isinstance(tasks, list) or len(tasks) > 250:
        raise ValueError("Dữ liệu công việc không hợp lệ")

    for ti, task in enumerate(tasks, 1):
        if not isinstance(task, dict):
            continue
        row = {
            "title": str(task.get("title") or "[CẦN BỔ SUNG]"),
            "type": str(task.get("type") or "Hằng ngày"),
            "status": str(task.get("status") or "Chờ xử lý"),
            "date": str(task.get("date") or data["report_date"] or "[CẦN BỔ SUNG]"),
            "assignee": str(task.get("assignee") or "[CẦN BỔ SUNG]"),
            "note": str(task.get("note") or ""),
            "images": [],
        }
        images = task.get("images") or []
        if not isinstance(images, list):
            images = []
        for ii, image in enumerate(images, 1):
            if isinstance(image, str):
                image = {"path": image}
            if not isinstance(image, dict):
                continue
            source = str(image.get("path") or image.get("url") or "")
            caption = str(image.get("caption") or ("Hình %d" % ii))
            try:
                raw, ext = _download_image(source, token)
                if raw:
                    local_path = os.path.join(img_dir, "task_%03d_img_%03d%s" % (ti, ii, ext))
                    with open(local_path, "wb") as fh:
                        fh.write(raw)
                    row["images"].append({"path": local_path, "caption": caption})
                else:
                    missing_images += 1
                    row["images"].append({"path": None, "caption": caption})
            except Exception:
                missing_images += 1
                row["images"].append({"path": None, "caption": caption})
        data["tasks"].append(row)
    return data, missing_images

def generate_pdf(payload, token):
    with tempfile.TemporaryDirectory(prefix="esta_report_") as td:
        data, missing_images = _prepare_data(payload, token, td)
        out_path = os.path.join(td, OUTPUT_NAME)
        build_doc(
            out_path,
            lambda: story_merged(data),
            "Tổng hợp & chi tiết",
            "ESTA - Báo cáo công việc kỹ thuật",
        )
        with open(out_path, "rb") as fh:
            return fh.read(), missing_images, len(data["tasks"])

class handler(BaseHTTPRequestHandler):
    def _send_json(self, status, obj):
        body = _json_bytes(obj)
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self._send_json(200, {"ok": True, "generator": "ESTA_Report_Generator", "format": "merged"})

    def do_POST(self):
        try:
            auth = self.headers.get("Authorization", "")
            token = auth[7:].strip() if auth.lower().startswith("bearer ") else ""
            _validate_token(token)

            length = int(self.headers.get("Content-Length") or 0)
            if length <= 0 or length > 2_500_000:
                self._send_json(413, {"error": "Dữ liệu báo cáo quá lớn hoặc trống"})
                return
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            pdf, missing_images, task_count = generate_pdf(payload, token)

            self.send_response(200)
            self.send_header("Content-Type", "application/pdf")
            self.send_header("Content-Disposition", 'attachment; filename="%s"' % OUTPUT_NAME)
            self.send_header("Content-Length", str(len(pdf)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-ESTA-Missing-Images", str(missing_images))
            self.send_header("X-ESTA-Task-Count", str(task_count))
            self.end_headers()
            self.wfile.write(pdf)
        except PermissionError as exc:
            self._send_json(401, {"error": str(exc)})
        except ValueError as exc:
            self._send_json(400, {"error": str(exc)})
        except Exception as exc:
            traceback.print_exc()
            self._send_json(500, {"error": "Không thể tạo PDF ESTA", "detail": str(exc)[:300]})

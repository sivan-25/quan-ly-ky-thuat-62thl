"""Run the static app and authenticated PDF API locally: python tools/dev_server.py."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from api.esta_report import handler as ReportHandler


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?')[0] == '/api/esta_report':
            return ReportHandler.do_GET(self)
        return super().do_GET()

    def do_POST(self):
        if self.path.split('?')[0] == '/api/esta_report':
            return ReportHandler.do_POST(self)
        self.send_error(404)

    _send_json = ReportHandler._send_json


if __name__ == '__main__':
    os.chdir(ROOT)
    port = int(os.environ.get('ESTA_DEV_PORT', '8080'))
    print(f'ESTA: http://localhost:{port}', flush=True)
    ThreadingHTTPServer(('0.0.0.0', port), Handler).serve_forever()

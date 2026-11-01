"""Run the static app and authenticated PDF API locally: python tools/dev_server.py."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import argparse
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
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default='0.0.0.0')
    parser.add_argument('--port', type=int, default=int(os.environ.get('ESTA_DEV_PORT', '8080')))
    parser.add_argument('--strictPort', action='store_true')
    args = parser.parse_args()
    port = args.port
    print(f'ESTA: http://localhost:{port}', flush=True)
    ThreadingHTTPServer((args.host, port), Handler).serve_forever()

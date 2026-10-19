"""Sirve la app en local para probarla (19-10-2026).

    python _herramientas/servir.py [puerto]      (8300 si no se dice)

Como «python -m http.server», pero aguanta varias pruebas a la vez (Chrome pide más de cien módulos de golpe y la
cola de 5 conexiones del servidor de serie se llenaba: «ERR_CONNECTION_REFUSED») y dice al navegador que no guarde
nada en caché, para que cada prueba vea los archivos tal como están ahora.
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


class SinCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *args):
        pass  # sin una línea por petición


class Servidor(ThreadingHTTPServer):
    request_queue_size = 256
    daemon_threads = True


if __name__ == '__main__':
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8300
    with Servidor(('127.0.0.1', puerto), partial(SinCache, directory=str(RAIZ))) as servidor:
        print(f'Paglot en http://localhost:{puerto}/index.html')
        servidor.serve_forever()

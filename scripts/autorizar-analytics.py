#!/usr/bin/env python3
"""Autoriza GA4 por loopback y guarda OAuth en 1Password sin mostrar secretos.

Ejecutar en el VPS. En el ordenador con navegador, abrir antes el túnel:
ssh -N -L 8765:127.0.0.1:8765 fran@100.103.185.86
Requiere acceso a ese servidor por Tailscale/SSH. No cambia OAuth de correo.
"""
import base64
import hashlib
import http.server
import json
import secrets
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request

OP = "/home/fran/.local/bin/ai-op"
SCOPES = ["https://www.googleapis.com/auth/analytics.edit", "https://www.googleapis.com/auth/analytics.readonly"]
REDIRECT = "http://127.0.0.1:8765/"


def op(*args, body=None):
    result = subprocess.run([OP, *args], input=json.dumps(body) if body is not None else None, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError("1Password no pudo completar " + args[0] + " " + args[1] + "; no se ha mostrado su salida sensible")
    return json.loads(result.stdout)


def main():
    client = op("document", "get", "a72qwnjsuag3mpj3ub4hqztr6q", "--vault", "EDE")["installed"]
    # Validar la plantilla antes de pedir autorización a la persona.
    template = op("item", "template", "get", "API Credential")
    state = secrets.token_urlsafe(32)
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    result = {}

    class Callback(http.server.BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass  # Nunca registrar el código OAuth de la URL.

        def do_GET(self):
            params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            if not secrets.compare_digest(params.get("state", [""])[0], state):
                self.send_error(400, "Solicitud no reconocida")
                return
            if "code" in params:
                result["code"] = params["code"][0]
                message = "Autorizacion recibida. Puedes cerrar esta pestana; el agente comprobara GA4."
            else:
                result["error"] = True
                message = "Google no ha concedido la autorizacion."
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(message.encode())

    with http.server.HTTPServer(("127.0.0.1", 8765), Callback) as server:
        server.timeout = 1
        url = client["auth_uri"] + "?" + urllib.parse.urlencode({
            "client_id": client["client_id"], "redirect_uri": REDIRECT, "response_type": "code",
            "scope": " ".join(SCOPES), "access_type": "offline", "prompt": "consent",
            "login_hint": "contacto@eudemonia.es", "state": state,
            "code_challenge": challenge, "code_challenge_method": "S256",
        })
        print("Abre el tunel SSH y despues esta URL publica de autorizacion con contacto@eudemonia.es:", flush=True)
        print(url, flush=True)
        deadline = time.monotonic() + 1800
        while not result and time.monotonic() < deadline:
            server.handle_request()
    if "code" not in result:
        raise RuntimeError("No se recibio la autorizacion en 30 minutos; vuelve a ejecutar el script")
    payload = urllib.parse.urlencode({
        "client_id": client["client_id"], "client_secret": client["client_secret"],
        "code": result.pop("code"), "code_verifier": verifier, "redirect_uri": REDIRECT,
        "grant_type": "authorization_code",
    }).encode()
    try:
        with urllib.request.urlopen(urllib.request.Request(client["token_uri"], data=payload), timeout=30) as response:
            tokens = json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError("Google rechazo el intercambio OAuth: HTTP " + str(error.code)) from None
    if not tokens.get("refresh_token"):
        raise RuntimeError("Google no devolvio refresh token; repetir la autorizacion con consentimiento")
    if not set(SCOPES).issubset(tokens.get("scope", "").split()):
        raise RuntimeError("Faltan permisos de Analytics en la autorizacion concedida")
    template["title"] = "GA4 eudemonia.es — OAuth Analytics"
    for name, value in {
        "GOOGLE_OAUTH_CLIENT_ID": client["client_id"],
        "GOOGLE_OAUTH_CLIENT_SECRET": client["client_secret"],
        "GOOGLE_OAUTH_REFRESH_TOKEN": tokens["refresh_token"],
    }.items():
        template["fields"].append({"id": name.lower(), "label": name, "type": "CONCEALED", "value": value})
    saved = op("item", "create", "--vault", "EDE", "--format=json", "-", body=template)
    print("OAuth guardado en 1Password/EDE. Elemento: " + saved["id"], flush=True)


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, OSError, KeyError, ValueError) as error:
        # Los mensajes propios no incluyen tokens ni respuestas de 1Password/Google.
        print("No se completo la autorizacion: " + str(error), flush=True)
        raise SystemExit(1)

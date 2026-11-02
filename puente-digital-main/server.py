"""
=============================================================================
PUENTE DIGITAL - SERVIDOR BACKEND (PYTHON 3 + SQLITE + API REST + IA)
=============================================================================
Trabajo Integrador Final
Equipo:
  - MARI, Rony Sebastián
  - CENTURIÓN, Tomás Gabriel
  - RODRÍGUEZ, Santiago Adrián
  - CALOGERÓPULOS, Alexandro
  - CENTURIÓN, Valeria Analía

Módulos incluidos:
  - Servidor HTTP multi-hilo para despachar la aplicación web.
  - Base de datos relacional SQLite (puente_digital.db).
  - API REST de Autenticación de Alumnos (/api/auth/login, /api/auth/register).
  - API de Certificados y Diplomas (/api/certificates).
  - Motor de Detección Antifraude (/api/analyze-scam).
  - Integración con Inteligencia Artificial (/api/ai/chat) con Gemini API y fallback gerontológico.
=============================================================================
"""

import http.server
import json
import mimetypes
import os
import re
import sqlite3
import sys
import urllib.parse
import urllib.request
from datetime import datetime
from socketserver import ThreadingMixIn

# Configuración del entorno
PORT = int(os.environ.get("PORT", 8000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "puente_digital.db")


# ---------------------------------------------------------------------------
# 1. GESTIÓN DE BASE DE DATOS SQLITE
# ---------------------------------------------------------------------------
def init_database():
    """Inicializa las tablas de persistencia en SQLite."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'ALUMNO',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS certificates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            student_name TEXT NOT NULL,
            course_title TEXT NOT NULL,
            score INTEGER DEFAULT 100,
            issued_date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    seed_users = [
        ("profesor", "profesor", "Prof. Alejandro", "DOCENTE"),
        ("docente", "docente", "Prof. Alejandro", "DOCENTE"),
        ("marte", "marte", "Marte", "ALUMNO"),
        ("marta", "marta", "Marta", "ALUMNO"),
        ("pedro", "pedro", "Pedro", "ALUMNO"),
        ("felipe", "felipe", "Felipe", "ALUMNO"),
        ("RONY", "RONY", "Rony", "ALUMNO")
    ]
    for u, p, n, r in seed_users:
        cursor.execute("SELECT id FROM users WHERE UPPER(username) = ?", (u.upper(),))
        if not cursor.fetchone():
            cursor.execute(
                "INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)",
                (u, p, n, r)
            )

    conn.commit()
    conn.close()
    print(f"[*] Base de datos SQLite lista en: {DB_PATH}")


# ---------------------------------------------------------------------------
# 2. MOTOR DE ANÁLISIS ANTIFRAUDE Y ESTAFAS DIGITALES
# ---------------------------------------------------------------------------
def analyze_scam_message(text: str) -> dict:
    """Evalúa un texto sospechoso en busca de patrones comunes de fraude o phishing."""
    if not text or not text.strip():
        return {
            "risk_score": 0,
            "risk_level": "BAJO",
            "findings": ["No se proporcionó texto para analizar."],
            "recommendation": "Ingresá un mensaje sospechoso para evaluarlo."
        }

    lower_text = text.lower()
    score = 0
    findings = []

    # Urgencia o presión psicológica
    urgency_patterns = [
        r"\burgente\b", r"\binmediatamente\b", r"\bultim[oa] aviso\b",
        r"\bbloquead[oa]\b", r"\bsuspensi[oó]n\b", r"\bvence hoy\b",
        r"\bcuenta suspendida\b", r"\b24 horas\b"
    ]
    for pattern in urgency_patterns:
        if re.search(pattern, lower_text):
            score += 25
            findings.append("⚠️ Transmite urgencia o amenazas de bloqueo (típico de estafas).")
            break

    # Premios o transferencias no solicitadas
    reward_patterns = [
        r"\bganaste\b", r"\bpremio\b", r"\bsorteo\b", r"\bseleccionad[oa]\b",
        r"\bmillonario\b", r"\bherencia\b", r"\bbono extraordinario\b"
    ]
    for pattern in reward_patterns:
        if re.search(pattern, lower_text):
            score += 30
            findings.append("🎁 Promete premios o dinero fácil de cosas en las que no participaste.")
            break

    # Solicitud de claves o token
    credential_patterns = [
        r"\bcontrase[ñn]a\b", r"\bclave\b", r"\btoken\b", r"\bc[oó]digo de seguridad\b",
        r"\botp\b", r"\bpin\b", r"\bcbu\b", r"\bcvu\b", r"\bdni\b"
    ]
    for pattern in credential_patterns:
        if re.search(pattern, lower_text):
            score += 35
            findings.append("🚨 Pide datos sensibles o contraseñas (NINGÚN banco pide esto por mensaje).")
            break

    # Enlaces externos sospechosos
    if re.search(r"https?://[^\s]+", text):
        if re.search(r"(bit\.ly|tinyurl|is\.gd|goo\.gl|t\.co)", lower_text):
            score += 25
            findings.append("🔗 Contiene un enlace acortado que oculta la página web real de destino.")
        else:
            score += 15
            findings.append("🔗 Contiene enlaces que te piden hacer clic para salir del mensaje.")

    if score >= 60:
        risk_level = "ALTO"
        rec = "🛑 ¡PELIGRO! Este mensaje tiene características claras de ESTAFA. No toques ningún enlace ni des tus datos."
    elif score >= 30:
        risk_level = "MEDIO"
        rec = "⚠️ ATENCIÓN: El mensaje resulta sospechoso. Consultá con un familiar de confianza antes de responder."
    else:
        risk_level = "BAJO"
        rec = "✅ El mensaje no presenta señales evidentes de peligro inmediato, pero recordá siempre mantener la precaución."

    return {
        "risk_score": min(score, 100),
        "risk_level": risk_level,
        "findings": findings if findings else ["No se detectaron palabras trampa comunes."],
        "recommendation": rec
    }


# ---------------------------------------------------------------------------
# 3. INTEGRACIÓN CON INTELIGENCIA ARTIFICIAL (GEMINI API + MOTOR LOCAL)
# ---------------------------------------------------------------------------
def query_gemini_ai(query: str, api_key: str) -> dict:
    """Envía la consulta del alumno a Google Gemini con un system prompt gerontológico."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    prompt_payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": (
                            "Eres el 'Compañero Digital con Inteligencia Artificial' de Puente Digital, "
                            "una plataforma de inclusión tecnológica para personas mayores. "
                            "Tu tono debe ser extremadamente paciente, cálido, respetuoso y empático. "
                            "Explica de forma muy clara, con oraciones cortas, sin tecnicismos en inglés. "
                            "Responde obligatoriamente en formato JSON con las siguientes claves exactas: "
                            "'title' (título corto y cariñoso), "
                            "'answer' (explicación breve y reconfortante), "
                            "'steps' (lista de 3 a 5 pasos numerados sencillos), "
                            "'tip' (consejo de tranquilidad o seguridad). "
                            f"\n\nPregunta del alumno mayor: {query}"
                        )
                    }
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.3,
            "maxOutputTokens": 600
        }
    }

    req_data = json.dumps(prompt_payload).encode("utf-8")
    req = urllib.request.Request(url, data=req_data, headers={"Content-Type": "application/json"})
    
    with urllib.request.urlopen(req, timeout=12) as response:
        result_json = json.loads(response.read().decode("utf-8"))
        raw_text = result_json["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(raw_text)
        return {
            "title": parsed.get("title", "Consejo de tu Compañero con IA"),
            "answer": parsed.get("answer", "Estoy aquí para acompañarte paso a paso."),
            "steps": parsed.get("steps", []),
            "tip": parsed.get("tip", "Recordá que tocar la pantalla no rompe nada y todo tiene marcha atrás."),
            "source": "gemini-api"
        }


def resolve_local_ai_response(query: str) -> dict:
    """Motor de Inteligencia Artificial pedagógica local estructurada (fallback offline)."""
    q = query.lower()
    
    if any(k in q for k in ["foto", "imagen", "galeria", "mandar foto", "enviar foto"]):
        return {
            "title": "Cómo mandar una fotografía por WhatsApp",
            "answer": "¡Es hermoso compartir fotos con la familia! Vamos paso a paso sin apuro:",
            "steps": [
                "Abrí WhatsApp y tocá el chat de la persona a quien querés mandarle la foto.",
                "Al lado de donde escribís los mensajes, buscá el dibujito del ganchito de papel (📎) o la camarita (📷).",
                "Tocá la opción 'Galería' para ver todas tus fotos guardadas.",
                "Elegí la foto que te guste tocándola una vez.",
                "Presioná el botón circular verde con la flechita para enviarla."
            ],
            "tip": "💡 Podés practicar esto ahora mismo en nuestro Simulador de WhatsApp sin ningún peligro.",
            "source": "ia-local"
        }
    elif any(k in q for k in ["audio", "grabar", "microfono", "voz"]):
        return {
            "title": "Cómo mandar un mensaje de voz o audio",
            "answer": "Mandar audios es ideal para no cansar los dedos escribiendo:",
            "steps": [
                "Entrá al chat de tu familiar en WhatsApp.",
                "Abajo a la derecha verás un botón verde con el dibujo de un micrófono (🎤).",
                "Mantenelo apretado con la yema del dedo mientras hablás despacio y claro.",
                "Cuando termines de hablar, soltá el botón y el audio se enviará solito."
            ],
            "tip": "💡 Si te cansás de apretar, deslizá el dedo hacia arriba hasta el candadito para hablar sin sostener.",
            "source": "ia-local"
        }
    elif any(k in q for k in ["tilde", "palomita", "visto", "azul"]):
        return {
            "title": "El significado de los tildes en WhatsApp",
            "answer": "Los tildes al costado de tus mensajes te indican qué pasó con lo que escribiste:",
            "steps": [
                "Un tilde gris (✓): Tu mensaje ya salió de tu teléfono correctamente.",
                "Dos tildes grises (✓✓): El mensaje ya llegó al teléfono de tu familiar.",
                "Dos tildes azules (✓✓): Tu familiar ya abrió la conversación y leyó el mensaje."
            ],
            "tip": "🧘 Consejo: Si no te responden enseguida, no te preocupes; quizás están ocupados y contestarán luego.",
            "source": "ia-local"
        }
    elif any(k in q for k in ["descargar", "instalar", "play store", "bajar app", "aplicacion"]):
        return {
            "title": "Cómo descargar una aplicación de forma segura",
            "answer": "Descargar aplicaciones en tu celular es totalmente seguro siguiendo esta regla de oro:",
            "steps": [
                "Buscá en tu celular el ícono con forma de triángulo de colores llamado 'Play Store'.",
                "Arriba en la barra de búsqueda escribí el nombre de la app (ej: 'PAMI Móvil').",
                "Fijate bien que diga el creador oficial y no tenga la palabra 'Anuncio' o 'Patrocinado'.",
                "Tocá el botón verde 'Instalar' una sola vez y esperá a que diga 'Abrir'."
            ],
            "tip": "🛡️ Regla de oro: Jamás descargues aplicaciones de enlaces que te manden por mensajes desconocidos.",
            "source": "ia-local"
        }
    else:
        return {
            "title": "Estoy aquí para acompañarte en tu aprendizaje",
            "answer": f"¡Qué buena pregunta! Respecto a '{query}', en Puente Digital vamos paso a paso para que aprendas con confianza:",
            "steps": [
                "Podés recorrer nuestros cursos interactivos desde el menú 'Aprender'.",
                "Podés practicar en los simuladores de teléfono sin miedo a cometer errores.",
                "Si tenés dudas con una lección, podés presionar el botón 'Escuchar' para oírla explicada con calma."
            ],
            "tip": "💡 Podés preguntarme cosas como: '¿Cómo mando una foto?', '¿Cómo conectar Wi-Fi?' o '¿Cómo sé si un mensaje es trampa?'.",
            "source": "ia-local"
        }


# ---------------------------------------------------------------------------
# 4. CONTROLADOR HTTP MULTIHILO Y ENRUTADOR API
# ---------------------------------------------------------------------------
class ThreadedHTTPServer(ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


class PuenteDigitalRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Manejador de peticiones para servir Frontend y responder a la API REST."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def _send_json(self, status_code: int, data: dict):
        response_bytes = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(response_bytes)

    def _read_json_body(self) -> dict:
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            raw_body = self.rfile.read(content_length).decode("utf-8")
            return json.loads(raw_body)
        return {}

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path in ["/api/status", "/api/health"]:
            self._send_json(200, {
                "status": "online",
                "platform": "Puente Digital 2.0 (Backend Python con Inteligencia Artificial)",
                "python_version": sys.version.split()[0],
                "database": "SQLite 3",
                "ai_enabled": True,
                "timestamp": datetime.now().isoformat()
            })
            return

        if path == "/api/certificates":
            try:
                conn = sqlite3.connect(DB_PATH)
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute("SELECT code, student_name, course_title, score, issued_date FROM certificates ORDER BY id DESC")
                rows = [dict(row) for row in cursor.fetchall()]
                conn.close()
                self._send_json(200, {"success": True, "certificates": rows})
            except Exception as e:
                self._send_json(500, {"success": False, "error": str(e)})
            return

        if path == "/api/users":
            try:
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute("SELECT id, username, name, role, created_at FROM users")
                users = [
                    {"id": r[0], "username": r[1], "name": r[2], "role": r[3], "created_at": r[4]}
                    for r in cursor.fetchall()
                ]
                conn.close()
                self._send_json(200, {"success": True, "users": users})
            except Exception as e:
                self._send_json(500, {"success": False, "error": str(e)})
            return

        super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        # 1. Consulta al Compañero con Inteligencia Artificial
        if path == "/api/ai/chat":
            try:
                payload = self._read_json_body()
                query = payload.get("query", "").strip()
                if not query:
                    self._send_json(400, {"success": False, "message": "Por favor ingresá tu pregunta."})
                    return

                api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
                ai_result = None

                if api_key:
                    try:
                        ai_result = query_gemini_ai(query, api_key)
                    except Exception as err:
                        print(f"[*] Gemini API remota no disponible ({err}), usando motor pedagógico local.")

                if not ai_result:
                    ai_result = resolve_local_ai_response(query)

                self._send_json(200, {"success": True, "result": ai_result})
            except Exception as e:
                self._send_json(500, {"success": False, "error": str(e)})
            return

        # 2. Login de Alumnos
        if path == "/api/auth/login":
            try:
                payload = self._read_json_body()
                username = payload.get("username", "").strip().upper()
                password = payload.get("password", "").strip()

                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT id, username, name, role FROM users WHERE UPPER(username) = ? AND password = ?",
                    (username, password)
                )
                user = cursor.fetchone()
                conn.close()

                if user:
                    self._send_json(200, {
                        "success": True,
                        "message": f"¡Bienvenido de vuelta, {user[2]}!",
                        "user": {"id": user[0], "username": user[1], "name": user[2], "role": user[3]}
                    })
                else:
                    self._send_json(401, {
                        "success": False,
                        "message": "Usuario o contraseña no coinciden. Revisá que estén bien escritos."
                    })
            except Exception as e:
                self._send_json(500, {"success": False, "error": str(e)})
            return

        # 3. Registro de Alumnos
        if path == "/api/auth/register":
            try:
                payload = self._read_json_body()
                name = payload.get("name", "").strip()
                username = payload.get("username", "").strip().upper()
                password = payload.get("password", "").strip()

                if not name or not username or not password:
                    self._send_json(400, {
                        "success": False,
                        "message": "Por favor completá tu nombre, usuario y contraseña."
                    })
                    return

                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                try:
                    cursor.execute(
                        "INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, 'ALUMNO')",
                        (username, password, name)
                    )
                    conn.commit()
                    user_id = cursor.lastrowid
                    conn.close()

                    self._send_json(201, {
                        "success": True,
                        "message": f"¡Cuenta creada con éxito! Bienvenido, {name}.",
                        "user": {"id": user_id, "username": username, "name": name, "role": "ALUMNO"}
                    })
                except sqlite3.IntegrityError:
                    conn.close()
                    self._send_json(409, {
                        "success": False,
                        "message": "Ese nombre de usuario ya está en uso. Elegí otro diferente."
                    })
            except Exception as e:
                self._send_json(500, {"success": False, "error": str(e)})
            return

        # 4. Registro de Certificados
        if path == "/api/certificates":
            try:
                payload = self._read_json_body()
                code = payload.get("code") or f"PD-{int(datetime.now().timestamp())}"
                student_name = payload.get("student_name", "Alumno Puente Digital")
                course_title = payload.get("course_title", "Curso Completado")
                score = payload.get("score", 100)
                issued_date = payload.get("issued_date", datetime.now().strftime("%d/%m/%Y"))

                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO certificates (code, student_name, course_title, score, issued_date)
                    VALUES (?, ?, ?, ?, ?)
                """, (code, student_name, course_title, score, issued_date))
                conn.commit()
                conn.close()

                self._send_json(201, {
                    "success": True,
                    "message": "Certificado registrado correctamente en el servidor.",
                    "certificate": {
                        "code": code,
                        "student_name": student_name,
                        "course_title": course_title,
                        "issued_date": issued_date
                    }
                })
            except Exception as e:
                self._send_json(500, {"success": False, "error": str(e)})
            return

        # 5. Detección Antifraude
        if path == "/api/analyze-scam":
            try:
                payload = self._read_json_body()
                message_text = payload.get("text", "")
                result = analyze_scam_message(message_text)
                self._send_json(200, {"success": True, "analysis": result})
            except Exception as e:
                self._send_json(500, {"success": False, "error": str(e)})
            return

        self._send_json(404, {"success": False, "message": "Endpoint no encontrado."})


# ---------------------------------------------------------------------------
# 5. ARRANQUE DEL SERVIDOR
# ---------------------------------------------------------------------------
def run_server():
    init_database()

    mimetypes.add_type("application/manifest+json", ".json")
    mimetypes.add_type("application/manifest+json", ".webmanifest")
    mimetypes.add_type("image/svg+xml", ".svg")

    server_address = ("", PORT)
    try:
        httpd = ThreadedHTTPServer(server_address, PuenteDigitalRequestHandler)
    except OSError as err:
        if err.errno in [98, 10048]:
            fallback_port = PORT + 1
            print(f"[!] Puerto {PORT} ocupado. Probando en http://localhost:{fallback_port}...")
            httpd = ThreadedHTTPServer(("", fallback_port), PuenteDigitalRequestHandler)
        else:
            raise

    actual_port = httpd.server_address[1]
    print("=" * 60)
    print("  PUENTE DIGITAL - SERVIDOR PYTHON + IA INICIADO")
    print("=" * 60)
    print(f"  URL Local:        http://localhost:{actual_port}")
    print(f"  Base de Datos:    {DB_PATH} (SQLite 3)")
    print(f"  Endpoints API:    /api/status")
    print(f"                    /api/ai/chat (Inteligencia Artificial)")
    print(f"                    /api/auth/login")
    print(f"                    /api/auth/register")
    print(f"                    /api/certificates")
    print(f"                    /api/analyze-scam")
    print("=" * 60)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Servidor detenido ordenadamente.")
        httpd.server_close()


if __name__ == "__main__":
    run_server()

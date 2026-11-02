/**
 * Puente Digital - Servidor HTTP Local con Soporte para API de IA
 * Trabajo Integrador Final
 * Autores: MARI, Rony Sebastián; CENTURIÓN, Tomás Gabriel; RODRÍGUEZ, Santiago Adrián; CALOGERÓPULOS, Alexandro; CENTURIÓN, Valeria Analía
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function resolveAiResponse(query) {
  const q = (query || '').toLowerCase();
  if (q.includes('foto') || q.includes('imagen') || q.includes('galeria')) {
    return {
      title: 'Cómo mandar una fotografía por WhatsApp',
      answer: '¡Es muy lindo compartir fotos con la familia! Vamos paso a paso sin apurarnos:',
      steps: [
        'Abrí WhatsApp y tocá el chat de la persona a quien querés mandarle la foto.',
        'Al lado de donde escribís, buscá el dibujito del ganchito de papel (📎) o la camarita (📷).',
        'Tocá la opción "Galería" para ver todas tus fotos.',
        'Elegí la foto que te guste tocándola una vez.',
        'Presioná el botón circular verde con la flechita para enviarla.'
      ],
      tip: '💡 Podés practicar esto ahora mismo en nuestro Simulador de WhatsApp sin ningún peligro.',
      source: 'ia-educativa'
    };
  }
  if (q.includes('audio') || q.includes('voz') || q.includes('microfono')) {
    return {
      title: 'Cómo mandar un mensaje de voz o audio',
      answer: 'Mandar audios es ideal para no cansar los dedos escribiendo. Es muy fácil:',
      steps: [
        'Entrá al chat de tu familiar en WhatsApp.',
        'Abajo a la derecha verás un botón verde con el dibujo de un micrófono (🎤).',
        'Mantenelo apretado con la yema del dedo mientras hablás despacio y claro.',
        'Cuando termines de hablar, soltá el botón y el audio se enviará solito.'
      ],
      tip: '💡 Si te cansás de mantener apretado, deslizá el dedo hacia arriba hasta el candadito para hablar sin sostener.',
      source: 'ia-educativa'
    };
  }
  if (q.includes('descargar') || q.includes('instalar') || q.includes('play store') || q.includes('app')) {
    return {
      title: 'Cómo descargar una aplicación de forma segura',
      answer: 'Descargar aplicaciones en tu celular es totalmente seguro si seguís esta regla de oro:',
      steps: [
        'Buscá en tu celular el ícono con forma de triángulo de colores llamado "Play Store".',
        'Arriba en la barra de búsqueda escribí el nombre de la app (ej: "PAMI Móvil").',
        'Fijate bien que diga el creador oficial y no tenga la palabra "Anuncio" o "Patrocinado".',
        'Tocá el botón verde "Instalar" una sola vez y esperá a que diga "Abrir".'
      ],
      tip: '🛡️ Regla de oro: Jamás descargues aplicaciones de enlaces que te manden por mensajes desconocidos.',
      source: 'ia-educativa'
    };
  }
  return {
    title: 'Compañero Digital con Inteligencia Artificial',
    answer: `¡Qué buena pregunta sobre "${query}"! En Puente Digital vamos paso a paso con paciencia:`,
    steps: [
      'Podés recorrer las lecciones interactivas de nuestros 3 niveles en la sección "Aprender".',
      'Podés practicar en los simuladores de teléfono sin miedo a cometer errores.',
      'Si tenés dudas, tocá el botón "Escuchar" para oír cualquier lección leída con calma.'
    ],
    tip: '💡 Preguntame: "¿Cómo mando una foto?", "¿Qué significan los tildes?" o "¿Cómo detectar una estafa?".',
    source: 'ia-educativa'
  };
}

function createServer(port) {
  const server = http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0];

    // Soporte para solicitudes preflight OPTIONS (CORS)
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      });
      res.end();
      return;
    }

    // Endpoint de Inteligencia Artificial
    if (cleanUrl === '/api/ai/chat' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        let payload = {};
        try {
          payload = JSON.parse(body || '{}');
        } catch (e) {
          const match = body.match(/"?query"?\s*[:=]\s*"?([^"}\n\r]+)"?/i);
          payload = { query: match ? match[1].trim() : body.trim() };
        }
        const aiResult = resolveAiResponse(payload.query || payload.message || '');
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: true, result: aiResult }));
      });
      return;
    }

    // Endpoint de Estado
    if (cleanUrl === '/api/status' || cleanUrl === '/api/health') {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        status: 'online',
        ai_service: 'active',
        platform: 'Puente Digital 2.0 (Servidor Node.js)'
      }));
      return;
    }

    if (cleanUrl === '/' || cleanUrl === '') {
      cleanUrl = '/index.html';
    }

    const safePath = path.normalize(cleanUrl).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(BASE_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(`<h1>404 - Archivo no encontrado</h1><p>No se encontró: ${safePath}</p>`);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Service-Worker-Allowed': '/',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Puerto ${port} ocupado, probando en ${port + 1}...`);
      createServer(port + 1);
    } else {
      console.error('Error en el servidor:', err);
    }
  });

  server.listen(port, () => {
    console.log('====================================================');
    console.log('  PUENTE DIGITAL - SERVIDOR ACTIVO CON SOPORTE DE IA');
    console.log('====================================================');
    console.log(`  URL local:    http://localhost:${port}`);
    console.log(`  Endpoint IA:  http://localhost:${port}/api/ai/chat`);
    console.log('====================================================');
  });

  return server;
}

createServer(DEFAULT_PORT);

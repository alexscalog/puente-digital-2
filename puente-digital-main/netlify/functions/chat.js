/**
 * Puente Digital 2.0 - Netlify Serverless Function: Asistente de IA (Chat)
 * 
 * Gestiona consultas pedagógicas de personas mayores utilizando modelos de Inteligencia Artificial
 * (Google Gemini o OpenAI) con fallback educativo local garantizado.
 * 
 * Variables de entorno soportadas en Netlify Dashboard:
 * - GEMINI_API_KEY (recomendado) o GOOGLE_API_KEY
 * - OPENAI_API_KEY
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8'
};

// Base de conocimiento pedagógica de contingencia (fallback offline/sin credenciales)
function resolveFallbackResponse(query) {
  const q = (query || '').toLowerCase();
  
  if (q.includes('foto') || q.includes('imagen') || q.includes('galeria') || q.includes('adjuntar')) {
    return {
      title: 'Cómo enviar una fotografía por WhatsApp',
      answer: '¡Es muy lindo compartir fotos con la familia! Vamos paso a paso sin apurarnos:',
      steps: [
        'Abrí WhatsApp y tocá el chat de la persona a quien querés mandarle la foto.',
        'Al lado de donde escribís los mensajes, buscá el dibujito de un ganchito de papel (📎) o una camarita (📷).',
        'Tocá la opción "Galería" para ver todas tus fotos guardadas.',
        'Elegí la foto que te guste tocándola una vez.',
        'Presioná el botón circular verde con la flechita para enviarla.'
      ],
      tip: '💡 Podés practicar esto ahora mismo en nuestro Simulador de WhatsApp sin ningún peligro.',
      source: 'ia-educativa-local'
    };
  }

  if (q.includes('audio') || q.includes('voz') || q.includes('microfono') || q.includes('grabar')) {
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
      source: 'ia-educativa-local'
    };
  }

  if (q.includes('descargar') || q.includes('instalar') || q.includes('play store') || q.includes('app') || q.includes('aplicacion')) {
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
      source: 'ia-educativa-local'
    };
  }

  if (q.includes('estafa') || q.includes('banco') || q.includes('sospechoso') || q.includes('clave') || q.includes('premio')) {
    return {
      title: 'Cómo reconocer un mensaje falso o estafa',
      answer: 'Tu tranquilidad y seguridad son lo más importante. Prestá atención a estas 3 señales:',
      steps: [
        'Si te dicen que ganaste un premio de un sorteo donde nunca participaste, es falso.',
        'Si te apuran diciendo que "bloquean tu cuenta en 24 horas", buscan asustarte para que actúes sin pensar.',
        'Ningún banco ni organismo público te va a pedir tu clave o token por WhatsApp o llamada.'
      ],
      tip: '🛑 Recordá: Ante la mínima duda, cortá la llamada o no respondas y consultá con alguien de tu confianza.',
      source: 'ia-educativa-local'
    };
  }

  return {
    title: 'Compañero Digital Puente Digital',
    answer: `¡Qué linda pregunta sobre "${query}"! En Puente Digital vamos paso a paso con paciencia:`,
    steps: [
      'Podés recorrer las lecciones interactivas de nuestros 3 niveles en la sección "Aprender".',
      'Podés practicar en los simuladores de teléfono sin miedo a cometer errores.',
      'Si tenés dudas, tocá el botón "Escuchar" para oír cualquier lección leída con calma.'
    ],
    tip: '💡 Preguntame: "¿Cómo mando una foto?", "¿Qué significan los tildes?" o "¿Cómo detectar una estafa?".',
    source: 'ia-educativa-local'
  };
}

// Consulta a Google Gemini API
async function queryGemini(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const systemInstruction = 
    'Eres Sofía, una tutora virtual afectuosa, cálida y paciente de la plataforma "Puente Digital", ' +
    'diseñada para enseñar tecnología a personas adultas mayores (abuelos/as). ' +
    'Debes responder de forma simple, empática, sin tecnicismos complejos. ' +
    'Responde OBLIGATORIAMENTE en formato JSON con la siguiente estructura exacta:\n' +
    '{\n' +
    '  "title": "Título corto y claro del tema",\n' +
    '  "answer": "Explicación cálida y reconfortante de 1 a 2 oraciones",\n' +
    '  "steps": ["Paso 1 muy claro", "Paso 2...", "Paso 3...", "Paso 4 opcional"],\n' +
    '  "tip": "Un consejo útil y tranquilizador con un emoji"\n' +
    '}';

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemInstruction}\n\nPregunta de la persona mayor: "${prompt}"` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 600,
      responseMimeType: 'application/json'
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Respuesta vacía de Gemini API');

  const parsed = JSON.parse(rawText);
  return {
    title: parsed.title || 'Consejo de Sofía',
    answer: parsed.answer || 'Aquí tienes una guía paso a paso:',
    steps: Array.isArray(parsed.steps) ? parsed.steps : [parsed.answer],
    tip: parsed.tip || '💡 Recuerda que puedes practicar en nuestros simuladores sin miedo.',
    source: 'gemini-ia'
  };
}

// Consulta a OpenAI API
async function queryOpenAI(prompt, apiKey) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const systemPrompt =
    'Eres Sofía, una tutora virtual afectuosa y muy paciente de "Puente Digital", ' +
    'enseñando tecnología a personas mayores. Responde siempre con calma, respeto y sin tecnicismos. ' +
    'Devuelve únicamente un JSON válido con campos: title (string), answer (string), steps (array de strings), tip (string).';

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.4,
    response_format: { type: 'json_object' }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Respuesta vacía de OpenAI');

  const parsed = JSON.parse(content);
  return {
    title: parsed.title || 'Consejo de Sofía',
    answer: parsed.answer || 'Aquí tienes una guía paso a paso:',
    steps: Array.isArray(parsed.steps) ? parsed.steps : [parsed.answer],
    tip: parsed.tip || '💡 No te preocupes por equivocarte; aprendemos juntos.',
    source: 'openai-ia'
  };
}

exports.handler = async (event, context) => {
  // Manejo de preflight CORS (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  // Comprobación de estado si es GET
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        status: 'online',
        service: 'Puente Digital AI Assistant (Netlify Serverless Function)',
        hasGeminiKey: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
        hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY)
      })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Método no permitido. Utiliza POST.' })
    };
  }

  // Parsear la consulta del usuario
  let queryText = '';
  try {
    const payload = JSON.parse(event.body || '{}');
    queryText = (payload.query || payload.message || payload.prompt || '').trim();
  } catch (err) {
    queryText = (event.body || '').trim();
  }

  if (!queryText) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        error: 'El campo "query" o mensaje no puede estar vacío.'
      })
    };
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  // 1. Intentar con Google Gemini
  if (geminiKey) {
    try {
      const geminiResult = await queryGemini(queryText, geminiKey);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, result: geminiResult })
      };
    } catch (geminiError) {
      console.warn('[Netlify Function] Falló llamada a Gemini API, intentando fallback:', geminiError.message);
    }
  }

  // 2. Intentar con OpenAI si Gemini no está o falló
  if (openAiKey) {
    try {
      const openAiResult = await queryOpenAI(queryText, openAiKey);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, result: openAiResult })
      };
    } catch (openAiError) {
      console.warn('[Netlify Function] Falló llamada a OpenAI API, intentando fallback:', openAiError.message);
    }
  }

  // 3. Fallback inteligente local (garantiza respuesta pedagógica siempre)
  const fallbackResult = resolveFallbackResponse(queryText);
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true, result: fallbackResult })
  };
};

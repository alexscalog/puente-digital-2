/**
 * Puente Digital - Servicio de Inteligencia Artificial (AIService)
 * Trabajo Integrador Final
 * Autores: MARI, Rony Sebastián; CENTURIÓN, Tomás Gabriel; RODRÍGUEZ, Santiago Adrián; CALOGERÓPULOS, Alexandro; CENTURIÓN, Valeria Analía
 * 
 * Gestiona la interacción con el modelo de Inteligencia Artificial (Backend API / Gemini)
 * y el reconocimiento/síntesis de voz para personas mayores.
 */

const AIService = (() => {
  // Detección dinámica de endpoint: Netlify Functions en producción o servidor Node local en desarrollo
  function getApiEndpoint() {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || window.location.protocol === 'file:';
      if (isLocal) {
        return window.location.port === '3000' ? '/api/ai/chat' : 'http://localhost:3000/api/ai/chat';
      }
    }
    // En producción (Netlify) se conecta a la Serverless Function
    return '/.netlify/functions/chat';
  }

  // Base de conocimiento local estructurada para respuestas pedagógicas inmediatas (Offline First)
  const LOCAL_KNOWLEDGE = [
    {
      keywords: ['foto', 'fotografía', 'imagen', 'mandar foto', 'enviar foto', 'galeria', 'adjuntar'],
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
      action: {
        type: 'OPEN_SIMULATOR',
        target: 'whatsapp-modal',
        label: '📲 Practicar en Simulador de WhatsApp'
      }
    },
    {
      keywords: ['tilde', 'tildes', 'palomita', 'palomitas', 'visto', 'doble tilde', 'azul', 'gris'],
      title: 'El significado de los tildes en WhatsApp',
      answer: 'Los tildes al costado de tus mensajes te indican qué pasó con lo que escribiste:',
      steps: [
        'Un tilde gris (✓): Tu mensaje ya salió de tu teléfono correctamente.',
        'Dos tildes grises (✓✓): El mensaje ya llegó al teléfono de tu familiar.',
        'Dos tildes azules (✓✓): Tu familiar ya abrió la conversación y vio el mensaje.'
      ],
      tip: '🧘 Consejo de tranquilidad: Si no te responden enseguida, no te preocupes. Quizás están ocupados o manejando y te contestarán más tarde.',
      action: {
        type: 'OPEN_LESSON',
        target: 'c2-1',
        label: '📖 Ver lección completa de WhatsApp'
      }
    },
    {
      keywords: ['audio', 'grabar voz', 'microfono', 'mandar audio', 'grabar mensaje'],
      title: 'Cómo mandar un mensaje de voz o audio',
      answer: 'Mandar audios es ideal para no cansar los dedos escribiendo. Es muy fácil:',
      steps: [
        'Entrá al chat de tu familiar en WhatsApp.',
        'Abajo a la derecha verás un botón verde con el dibujo de un micrófono (🎤).',
        'Mantenelo apretado con la yema del dedo mientras hablás despacio y claro.',
        'Cuando termines de hablar, soltá el botón y el audio se enviará solito.'
      ],
      tip: '💡 Si te cansás de mantener apretado, deslizá el dedo hacia arriba hasta el candadito para hablar sin sostener.',
      action: {
        type: 'OPEN_SIMULATOR',
        target: 'whatsapp-modal',
        label: '📲 Probar envío de audios en WhatsApp'
      }
    },
    {
      keywords: ['videollamada', 'camara', 'llamar con video', 'ver la cara', 'llamada con video'],
      title: 'Cómo hacer una videollamada para verte cara a cara',
      answer: 'Las videollamadas te permiten ver las sonrisas de tus seres queridos a la distancia:',
      steps: [
        'Abrí WhatsApp y tocá el nombre de tu familiar.',
        'Arriba a la derecha buscá el ícono con forma de camarita de video (📹).',
        'Tocá la camarita y confirmá tocando "Llamar".',
        'Esperá a que la otra persona atienda. Asegurate de tener buena luz de frente.',
        'Para cortar cuando terminen de charlar, tocá el botón circular rojo grande.'
      ],
      tip: '💡 Siempre es mejor hacer videollamadas conectados al Wi-Fi de casa para no consumir datos móviles.',
      action: {
        type: 'OPEN_LESSON',
        target: 'c2-2',
        label: '📖 Ver lección de Videollamadas'
      }
    },
    {
      keywords: ['descargar', 'instalar', 'bajar app', 'play store', 'aplicacion', 'pami movil', 'tienda'],
      title: 'Cómo descargar una aplicación de forma segura',
      answer: 'Descargar aplicaciones en tu celular es totalmente seguro si seguís esta regla de oro:',
      steps: [
        'Buscá en tu celular el ícono con forma de triángulo de colores llamado "Play Store".',
        'Arriba en la barra de búsqueda escribí el nombre de la app (por ejemplo: "PAMI Móvil").',
        'Fijate bien que diga el creador oficial y no tenga la palabra "Anuncio" o "Patrocinado".',
        'Tocá el botón verde "Instalar" una sola vez.',
        'Esperá unos minutos sin tocar la pantalla hasta que el botón diga "Abrir".'
      ],
      tip: '🛡️ Regla de oro: Jamás descargues aplicaciones de enlaces que te manden por mensaje o WhatsApp.',
      action: {
        type: 'OPEN_SIMULATOR',
        target: 'playstore-modal',
        label: '📲 Probar Simulador de Play Store'
      }
    },
    {
      keywords: ['estafa', 'trampa', 'banco', 'mensaje raro', 'sorteo', 'plata', 'sospechoso', 'cuento del tio', 'seguridad', 'premios'],
      title: 'Cómo reconocer un mensaje falso o estafa',
      answer: 'Tu tranquilidad y seguridad son lo más valioso. Prestá atención a estas 3 señales:',
      steps: [
        'Si te dicen que ganaste un premio de un sorteo donde nunca te anotaste, es falso.',
        'Si te apuran diciendo que "bloquean tu cuenta en 24 horas", buscan asustarte para que no pienses.',
        'Ningún banco ni organismo público te va a pedir tu contraseña por WhatsApp o llamada.'
      ],
      tip: '🛑 Recordá: Ante la mínima duda, cortá la llamada o no respondas y consultá con alguien de tu confianza.',
      action: {
        type: 'OPEN_SIMULATOR',
        target: 'scam-modal',
        label: '🧪 Practicar en el Detector de Estafas'
      }
    },
    {
      keywords: ['turno', 'medico', 'pami', 'anses', 'remedio', 'receta', 'farmacia'],
      title: 'Cómo gestionar turnos y trámites oficiales',
      answer: 'Hacer trámites desde el teléfono te ahorra filas largas y viajes cansadores:',
      steps: [
        'Instalá la aplicación oficial del organismo (ejemplo: "PAMI Móvil" o "Mi ANSES").',
        'Ingresá con tu número de DNI y tu clave de seguridad social.',
        'Buscá la sección que dice "Turnos" o "Cartilla Médica".',
        'Elegí el día y horario que te quede cómodo y guardá la constancia.'
      ],
      tip: '💡 Podés practicar buscando la aplicación de PAMI en nuestro Simulador de Play Store.',
      action: {
        type: 'OPEN_SIMULATOR',
        target: 'playstore-modal',
        label: '📲 Ir al Simulador de Descargas'
      }
    },
    {
      keywords: ['wifi', 'wi-fi', 'internet', 'datos', 'conectar internet', 'red'],
      title: 'Cómo conectarte a la red Wi-Fi de tu casa',
      answer: 'Estar conectado a Wi-Fi te permite navegar todo lo que quieras sin gastar crédito:',
      steps: [
        'Deslizá el dedo desde arriba de la pantalla de tu celular hacia abajo.',
        'Buscá el ícono que parece un abanico o arco de ondas (📶) y mantenelo apretado.',
        'Tocá el nombre de la red de tu casa.',
        'Escribí la contraseña (está anotada en la etiqueta del módem) respetando mayúsculas.',
        'Tocá "Conectar" y ¡listo!'
      ],
      tip: '💡 Cuando estás conectado a Wi-Fi, el dibujo del abanico aparece arriba en la esquinita de tu pantalla.',
      action: {
        type: 'OPEN_LESSON',
        target: 'c1-2',
        label: '📖 Ver lección de Conexiones'
      }
    },
    {
      keywords: ['letra', 'agrandar letra', 'no veo bien', 'letra chica', 'zoom', 'texto grande'],
      title: 'Cómo agrandar las letras para leer sin esfuerzo',
      answer: 'No tenés por qué forzar la vista; podés poner el tamaño de letra que te sea cómodo:',
      steps: [
        'En esta misma pantalla, mirá arriba a la derecha.',
        'Tocá el botón "A+ (Grande)" o "A++ (Muy Grande)" para agrandar todo de inmediato.',
        'En tu celular, podés ir a Ajustes ⚙️ > Pantalla > Tamaño de fuente.'
      ],
      tip: '👓 También podés activar el botón "🌙 Alto Contraste" arriba para leer letras claras sobre fondo oscuro.',
      action: {
        type: 'CUSTOM',
        target: 'SET_FONT_LARGE',
        label: '🔍 Agrandar letra ahora'
      }
    },
    {
      keywords: ['bateria', 'cargar', 'cargador', 'se apaga', 'ahorro de bateria', 'duracion'],
      title: 'Cuidados para que la batería de tu celular dure más',
      answer: 'Cuidar la batería de tu teléfono es sencillo:',
      steps: [
        'No esperes a que se apague en 0% para cargarlo; ponelo a cargar cuando llegue al 20%.',
        'Usá siempre el cargador original o uno de buena calidad para cuidar el teléfono.',
        'Bajá un poquito el brillo de la pantalla cuando estés dentro de casa.',
        'Desactivá la ubicación (GPS) cuando no estés usando mapas para viajar.'
      ],
      tip: '💡 Dejarlo cargando toda la noche no rompe los teléfonos modernos; cortan la carga automáticamente al llegar al 100%.',
      action: {
        type: 'OPEN_LESSON',
        target: 'c1-1',
        label: '📖 Conociendo tu celular desde cero'
      }
    }
  ];

  // Coincidencia heurística local
  function matchLocalKnowledge(text) {
    if (!text || typeof text !== 'string') return null;
    const cleanText = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    let bestMatch = null;
    let highestScore = 0;

    for (const item of LOCAL_KNOWLEDGE) {
      let score = 0;
      for (const kw of item.keywords) {
        const cleanKw = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (cleanText.includes(cleanKw)) {
          score += cleanKw.length;
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && highestScore > 0) {
      return bestMatch;
    }

    return {
      title: 'Estoy aquí para acompañarte',
      answer: '¡Qué buena pregunta! En Puente Digital vamos paso a paso para que aprendas sin presiones.',
      steps: [
        'Podés elegir cualquiera de nuestros 3 niveles de aprendizaje desde la sección "Aprender".',
        'O podés practicar en nuestros simuladores de teléfono sin miedo a equivocarte.',
        'Si tenés dudas con una lección específica, podés tocar el botón "🔊 Escuchar" para oírla explicada con calma.'
      ],
      tip: '💡 Podés preguntarme cosas como: "¿Cómo mando una foto?", "¿Qué significan los tildes?", o "¿Cómo saber si un mensaje es una estafa?".',
      action: {
        type: 'NAVIGATE',
        target: '#cursos-section',
        label: '📚 Ver todos los cursos'
      }
    };
  }

  // Consulta principal a la Inteligencia Artificial
  async function ask(query) {
    const endpoint = getApiEndpoint();
    // 1. Intentar consultar el endpoint del backend con Inteligencia Artificial
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.result) {
          return data.result;
        }
      }
    } catch (err) {
      // Si el servidor backend no está activo o se corre localmente sin conexión, pasar al motor local
    }

    // 2. Respuesta pedagógica local inmediata
    return matchLocalKnowledge(query);
  }

  // Reconocimiento de voz mediante Web Speech API
  let recognitionInstance = null;

  function isSpeechRecognitionSupported() {
    return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
  }

  function startSpeechRecognition(options = {}) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (options.onError) options.onError('El navegador no soporta reconocimiento de voz.');
      return null;
    }

    if (recognitionInstance) {
      try { recognitionInstance.abort(); } catch (e) {}
    }

    recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'es-ES';
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (options.onResult) options.onResult(transcript);
    };

    recognitionInstance.onerror = (event) => {
      if (options.onError) options.onError(event.error);
    };

    recognitionInstance.onend = () => {
      if (options.onEnd) options.onEnd();
    };

    try {
      recognitionInstance.start();
    } catch (err) {
      if (options.onError) options.onError(err);
    }

    return recognitionInstance;
  }

  function stopSpeechRecognition() {
    if (recognitionInstance) {
      try { recognitionInstance.stop(); } catch (e) {}
      recognitionInstance = null;
    }
  }

  return {
    ask,
    getApiEndpoint,
    isSpeechRecognitionSupported,
    startSpeechRecognition,
    stopSpeechRecognition,
    LOCAL_KNOWLEDGE
  };
})();

// Exportación global
window.AIService = AIService;
window.CompanionService = AIService;

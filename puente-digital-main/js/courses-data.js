/**
 * Puente Digital - Datos de Cursos, Niveles, Simuladores y Evaluaciones
 * Plataforma Educativa de Alfabetización Digital para Adultos Mayores
 */

const PUENTE_DATA = {
  projectInfo: {
    name: "Puente Digital",
    slogan: "No estás solo. Aprendemos juntos.",
    secondarySlogan: "El puente que te acerca a la tecnología, fácil y a tu propio ritmo",
    teamMembers: [
      { name: "MARI, Rony Sebastián", role: "Desarrollo y Arquitectura Web" },
      { name: "CENTURIÓN, Tomás Gabriel", role: "Diseño y Experiencia de Usuario" },
      { name: "RODRÍGUEZ, Santiago Adrián", role: "Pruebas y Seguridad Digital" },
      { name: "CALOGERÓPULOS, Alexandro", role: "Investigación y Gestión de Proyecto" },
      { name: "CENTURIÓN, Valeria Analía", role: "QA Tester y Pedagogía" }
    ],
    summary: "Propuesta educativa de alfabetización digital orientada a reducir la brecha tecnológica en personas mayores, brindando herramientas prácticas para la autonomía, comunicación y seguridad en la vida cotidiana."
  },

  levels: [
    {
      id: 1,
      tag: "nivel-1",
      number: "Nivel 1",
      title: "Introducción al Mundo Digital",
      subtitle: "Para empezar desde cero y sin miedo",
      color: "#1a56db",
      badgeText: "Comenzar desde cero",
      description: "Aprende las funciones básicas de tu celular, tablet o computadora. Descubrirás que no hay nada que puedas 'romper' y ganarás confianza paso a paso.",
      icon: "🌱",
      targetAudience: "Personas que nunca usaron o tienen muy poca experiencia con dispositivos digitales."
    },
    {
      id: 2,
      tag: "nivel-2",
      number: "Nivel 2",
      title: "Tecnología para la Vida Cotidiana",
      subtitle: "Para resolver tu día a día y comunicarte",
      color: "#059669",
      badgeText: "Práctico y cotidiano",
      description: "Aprende a comunicarte con tus seres queridos por WhatsApp, realizar videollamadas, buscar recetas o noticias, usar mapas y sacar turnos médicos sin hacer filas.",
      icon: "🌿",
      targetAudience: "Personas con nociones básicas que desean aprovechar la tecnología en sus tareas cotidianas."
    },
    {
      id: 3,
      tag: "nivel-3",
      number: "Nivel 3",
      title: "Autonomía y Seguridad Digital",
      subtitle: "Para navegar protegidos y sin trampas",
      color: "#7c3aed",
      badgeText: "Tranquilidad y seguridad",
      description: "Fortalece tu seguridad en Internet: cómo crear contraseñas fáciles de recordar pero difíciles de adivinar, reconocer mensajes falsos y evitar estafas telefónicas o digitales.",
      icon: "🌳",
      targetAudience: "Personas que ya usan aplicaciones y quieren proteger sus datos personales y tranquilidad."
    }
  ],

  courses: [
    // NIVEL 1
    {
      id: "c1-app-install",
      level: 1,
      title: "Cómo Descargar e Instalar Aplicaciones Seguras (Play Store)",
      category: "Curso Estrella • Práctico",
      duration: "15 min",
      icon: "📥",
      isFeatured: true,
      hasSimulator: true,
      hasQuiz: true,
      shortDesc: "Aprende a encontrar la tienda oficial, buscar apps como PAMI o WhatsApp, instalarlas gratis y comprobar que sean legítimas.",
      steps: [
        {
          title: "1. ¿Qué es la Play Store y dónde está?",
          text: "La Play Store (en celulares Android) es como un gran supermercado seguro donde viven todas las aplicaciones autorizadas. Se reconoce por tener un ícono con forma de triángulo de colores (azul, rojo, amarillo y verde). Nunca descargues aplicaciones desde enlaces que te manden por mensaje de texto o WhatsApp: siempre búscalas dentro de la Play Store.",
          tip: "💡 Consejo de oro: Si no encuentras el ícono del triángulo en tu pantalla, desliza el dedo hacia arriba en la pantalla principal para ver todas tus aplicaciones.",
          icon: "▶️"
        },
        {
          title: "2. Cómo buscar la aplicación correcta y evitar anuncios",
          text: "Arriba de todo en la Play Store verás una barra que dice 'Buscar apps y juegos'. Tócala una vez y escribe el nombre (por ejemplo: 'PAMI' o 'WhatsApp'). Presta mucha atención a los resultados: los primeros a veces tienen una etiqueta chiquita que dice 'Anuncio' o 'Patrocinado'. Pásalos de largo y busca la aplicación que tenga el logo original y millones de descargas.",
          tip: "🔍 Clave de seguridad: Revisa siempre que diga el desarrollador oficial (ej: 'Instituto Nacional de Servicios Sociales para Jubilados' o 'WhatsApp LLC').",
          icon: "🔎"
        },
        {
          title: "3. El botón verde 'Instalar' y el círculo de carga",
          text: "Una vez que tocaste la aplicación oficial, verás un botón grande verde que dice 'Instalar'. Tócalo una sola vez. No hace falta tocarlo de nuevo: verás un circulito que empieza a girar y unos números de porcentaje (10%, 50%, 100%). Eso significa que tu teléfono está trayendo la aplicación a través del Wi-Fi de tu casa.",
          tip: "⏳ Paciencia: Deja el celular sobre la mesa un momento. La descarga puede tardar entre 1 y 3 minutos según tu velocidad de Internet.",
          icon: "🟢"
        },
        {
          title: "4. ¿Dónde queda guardada y cómo abrirla?",
          text: "Cuando la descarga termina, el botón verde cambiará de palabra y dirá 'Abrir'. Si lo tocas, la aplicación se iniciará al instante. Además, quedará un ícono nuevo guardado en la pantalla de tu celular para que puedas entrar cada vez que lo necesites sin tener que volver a instalarla.",
          tip: "🎉 ¡Listo!: Ya tienes la aplicación en tu celular. No tienes que volver a instalarla nunca más.",
          icon: "📲"
        }
      ]
    },
    {
      id: "c1-1",
      level: 1,
      title: "Conociendo tu celular y computadora",
      category: "Dispositivos",
      duration: "10 min",
      icon: "📱",
      shortDesc: "Partes principales, botones de encendido, volumen y cómo cargar la batería correctamente.",
      steps: [
        {
          title: "1. El botón de encendido y apagado",
          text: "El botón de encendido suele estar al costado de tu celular. Para encenderlo, mantenlo presionado 3 segundos hasta que vibre o se ilumine la pantalla. Para apagar la pantalla cuando no lo usas, solo presiona una vez rápido.",
          tip: "💡 Consejo de oro: Si tocas la pantalla y no responde, apaga la pantalla una vez y vuelve a prenderla.",
          icon: "🔘"
        },
        {
          title: "2. La batería y la carga",
          text: "En la esquina de arriba de la pantalla verás un dibujito de una pila. Si tiene color verde o más del 30%, puedes usarlo tranquilo. Cuando llegue al 20%, enchúfalo con su cargador sin doblar el cable.",
          tip: "🔌 Tip útil: Conviene cargarlo sobre una mesa despejada, evitando dejarlo debajo de almohadas.",
          icon: "🔋"
        },
        {
          title: "3. La regla más importante: ¡No vas a romper nada!",
          text: "Muchas personas tienen miedo de tocar la pantalla por temor a 'desconfigurar' o 'romper' el aparato. Recuerda siempre: tocar un botón en la pantalla no rompe el celular. Siempre hay un botón con una flechita hacia atrás para volver a donde estabas.",
          tip: "🛡️ Confianza total: Todo lo que se toca en la pantalla tiene marcha atrás.",
          icon: "✨"
        }
      ]
    },
    {
      id: "c1-2",
      level: 1,
      title: "La pantalla táctil: Tocar, deslizar y agrandar",
      category: "Manejo Táctil",
      duration: "8 min",
      icon: "👆",
      shortDesc: "Aprende los movimientos con los dedos: el toque suave, deslizar para leer y agrandar fotos con dos dedos.",
      steps: [
        {
          title: "1. El toque suave (Pulsación)",
          text: "La pantalla funciona con la yema del dedo, con un toque suave y ligero como si tocaras una burbuja. No hace falta hacer fuerza ni apretar fuerte con la uña.",
          tip: "👉 Práctica: Un toque corto y suave es suficiente para abrir cualquier aplicación.",
          icon: "👇"
        },
        {
          title: "2. Deslizar la pantalla (Subir y bajar)",
          text: "Para leer noticias o ver fotos que están más abajo, apoya la yema del dedo en el centro de la pantalla y muévela despacito hacia arriba. Es como pasar la hoja de un libro o diario.",
          tip: "📜 Recuerda: Deslizar hacia arriba te muestra lo que está más abajo.",
          icon: "📜"
        },
        {
          title: "3. Agrandar fotos y letras (El pellizco)",
          text: "Si una letra o foto está muy chica, apoya dos dedos juntos en la pantalla y sepáralos despacio (como abriendo una tijera). La imagen se agrandará mágicamente para que la veas perfecto.",
          tip: "🔍 Comodidad: Puedes agrandar casi cualquier foto recibida en WhatsApp.",
          icon: "🔎"
        }
      ]
    },
    {
      id: "c1-3",
      level: 1,
      title: "Conectarse a Internet por Wi-Fi",
      category: "Conexión",
      duration: "10 min",
      icon: "📶",
      shortDesc: "Qué significa el dibujito de Wi-Fi, cómo saber si tienes Internet y cómo conectar la red de tu casa.",
      steps: [
        {
          title: "1. ¿Qué es el Wi-Fi?",
          text: "El Wi-Fi es como una radio invisible que lleva Internet a los aparatos de tu casa a través del módem. Cuando estás conectado al Wi-Fi de tu casa, no gastas el crédito ni los datos de tu abono de celular.",
          tip: "🏠 En casa: Siempre es mejor navegar conectados al Wi-Fi de nuestro hogar.",
          icon: "📡"
        },
        {
          title: "2. El símbolo del abanico",
          text: "Arriba a la derecha de tu teléfono verás un símbolo con forma de ondas o 'abanico'. Si está pintado de blanco o azul completo, significa que tu señal es excelente y tienes Internet rápido.",
          tip: "📶 Señal: Si el abanico tiene pocas rayas, estás lejos del módem de tu casa.",
          icon: "📶"
        },
        {
          title: "3. Cómo poner la clave de Wi-Fi",
          text: "Debajo del módem de tu casa hay una etiqueta con el nombre de la red y la contraseña. Con paciencia, ve a Ajustes > Wi-Fi, toca el nombre de tu casa y escribe las letras respetando mayúsculas y números.",
          tip: "📝 Tip: Anota la clave en un cuaderno con letra bien clara para no olvidarla.",
          icon: "🔑"
        }
      ]
    },
    {
      id: "c1-4",
      level: 1,
      title: "El teclado digital y el dictado por voz",
      category: "Escritura",
      duration: "12 min",
      icon: "⌨️",
      shortDesc: "Escribir sin equivocarse, borrar letras de más y el gran truco de dictar con el micrófono.",
      steps: [
        {
          title: "1. Letras, números y la tecla de borrar",
          text: "Cuando tocas un lugar para escribir, el teclado aparece abajo. La tecla con una cruz (⌫) sirve para borrar la última letra si te equivocas. La barra larga de abajo es el espacio entre palabras.",
          tip: "🧼 Si te equivocas: Toca la cruz y borra tantas letras como necesites.",
          icon: "⌨️"
        },
        {
          title: "2. El gran truco: Dictar con el micrófono",
          text: "En el teclado verás el dibujito de un pequeño micrófono 🎤. Si lo tocas una vez, puedes hablarle despacio y claro al celular, y el teléfono escribirá solito exactamente lo que vas diciendo.",
          tip: "🗣️ Descanso para los dedos: El micrófono te ahorra tener que teclear letra por letra.",
          icon: "🎤"
        },
        {
          title: "3. Cambiar a números y signos",
          text: "En una esquina del teclado suele haber una tecla que dice '?123'. Al tocarla, aparecen los números del 0 al 9, comas, puntos y signos de interrogación. Para volver a las letras, toca 'ABC'.",
          tip: "🔢 Fácil: Puedes alternar entre letras y números cuando quieras.",
          icon: "🔢"
        }
      ]
    },

    // NIVEL 2
    {
      id: "c2-1",
      level: 2,
      title: "WhatsApp: Mensajes, audios y fotos familiares",
      category: "Comunicación",
      duration: "15 min",
      icon: "💬",
      shortDesc: "Comunícate con tus hijos, nietos y amistades. Envía saludos, escucha audios y comparte recuerdos.",
      steps: [
        {
          title: "1. Enviar un mensaje de texto",
          text: "Abre WhatsApp (el ícono verde con un teléfono blanco). Toca el nombre de tu contacto en la lista. Toca la barra blanca abajo donde dice 'Mensaje', escribe tu saludo y presiona la flechita verde para enviarlo.",
          tip: "✉️ Listo: El mensaje viajará al instante a tu familiar.",
          icon: "📨"
        },
        {
          title: "2. Grabar y escuchar audios",
          text: "Para mandar un audio, mantén presionado el botón verde del micrófono al costado. Habla tranquilo y suelta cuando termines. Para escuchar un audio recibido, solo toca el triángulo verde (Play).",
          tip: "🎧 Comodidad: Puedes acercarte el teléfono a la oreja para escuchar audios en privado.",
          icon: "🎙️"
        },
        {
          title: "3. ¿Qué significan los tildes?",
          text: "Un tilde gris (✓) significa que tu mensaje salió. Dos tildes grises (✓✓) significa que llegó al celular de la otra persona. Dos tildes azules (✓✓) significa que ya lo abrieron y leyeron.",
          tip: "👀 Tranquilidad: Si no responden enseguida, es porque pueden estar ocupados.",
          icon: "✔️"
        }
      ]
    },
    {
      id: "c2-2",
      level: 2,
      title: "Videollamadas: Ver y hablar en vivo",
      category: "Comunicación",
      duration: "10 min",
      icon: "📹",
      shortDesc: "Aprende a realizar y responder videollamadas para ver las caras de tus seres queridos a la distancia.",
      steps: [
        {
          title: "1. Cómo iniciar una videollamada",
          text: "Entra a la conversación de la persona con la que deseas hablar. Arriba a la derecha verás una camarita de video. Tócala y confirma con 'Llamar'. Tu pantalla mostrará tu cámara y esperará que atiendan.",
          tip: "💡 Iluminación: Es ideal estar frente a una ventana o lámpara para que te vean clarito.",
          icon: "🎥"
        },
        {
          title: "2. Cómo atender una videollamada entrante",
          text: "Cuando te llamen por videollamada, el teléfono sonará y la pantalla mostrará quién llama. Desliza el botón verde de la cámara hacia arriba o hacia la derecha para atender.",
          tip: "📞 Atender: Si suena y no quieres video, puedes atender solo con voz.",
          icon: "📲"
        },
        {
          title: "3. Colgar la llamada al terminar",
          text: "Para terminar la videollamada, toca el botón circular rojo grande que tiene el dibujo de un teléfono hacia abajo. La llamada se cerrará y volverás a tu pantalla habitual.",
          tip: "🔴 Botón rojo: Siempre corta la comunicación de forma segura.",
          icon: "⭕"
        }
      ]
    },
    {
      id: "c2-3",
      level: 2,
      title: "Buscar en Google: Recetas, clima y noticias",
      category: "Información",
      duration: "12 min",
      icon: "🌐",
      shortDesc: "Aprende a hacerle preguntas a Internet para encontrar recetas de cocina, el clima de hoy y noticias confiables.",
      steps: [
        {
          title: "1. La barra de búsqueda de Google",
          text: "Google es como una gran biblioteca. Para buscar algo, abre el navegador (Chrome) o toca la barra de Google. Escribe de forma simple: por ejemplo, 'Clima hoy en mi ciudad' o 'Receta de pastel de papas'.",
          tip: "🔍 Sencillez: Escribe pocas palabras claras, no hace falta redactar cartas largas.",
          icon: "🔎"
        },
        {
          title: "2. Usar la voz para buscar",
          text: "Al lado de la barra de Google hay un micrófono de colores. Si lo tocas y dices: '¿A qué hora abre el banco mañana?', Google te leerá y mostrará el horario en pantalla.",
          tip: "🎙️ Magia: Hablarle a Google es una de las formas más cómodas para informarse.",
          icon: "🗣️"
        },
        {
          title: "3. Cómo elegir una página confiable",
          text: "En los resultados, elige diarios conocidos, páginas oficiales del gobierno (que terminan en .gob.ar o .org) o portales con trayectoria. Evita anuncios que parpadean o prometen cosas milagrosas.",
          tip: "⭐ Confiabilidad: Lee siempre con calma el título antes de hacer clic.",
          icon: "📰"
        }
      ]
    },
    {
      id: "c2-4",
      level: 2,
      title: "Sacar turnos por Internet (Médicos, PAMI y Anses)",
      category: "Trámites",
      duration: "15 min",
      icon: "🏥",
      shortDesc: "Paso a paso para reservar un turno médico o de trámites sin tener que salir temprano a hacer colas.",
      steps: [
        {
          title: "1. Tener a mano tus datos personales",
          text: "Antes de empezar cualquier trámite, ten sobre la mesa tu DNI físico, tu número de afiliado o credencial médica y un anotador con lapicera para apuntar los números que te den.",
          tip: "📋 Organización: Tener los documentos a la vista evita que la sesión se cierre por tiempo.",
          icon: "🪪"
        },
        {
          title: "2. Ingresar solo a la página oficial",
          text: "Asegúrate de entrar a la dirección web correcta (ej: pami.org.ar o anses.gob.ar). Busca el botón grande que suele decir 'Solicitar Turno' o 'Sacar Turno'.",
          tip: "🔒 Seguridad: Las páginas oficiales del Estado terminan siempre en .gob o .gov.",
          icon: "🏛️"
        },
        {
          title: "3. Elegir fecha, hora y guardar comprobante",
          text: "El sistema te mostrará un calendario con días disponibles. Elige el horario que te quede más cómodo. Al confirmar, aparecerá un comprobante con un código. Puedes sacarle una foto a la pantalla con otro celular o anotarlo en tu libreta.",
          tip: "📸 Constancia: Una foto a la pantalla con el celular es el mejor comprobante.",
          icon: "📅"
        }
      ]
    },

    // NIVEL 3
    {
      id: "c3-1",
      level: 3,
      title: "Crear contraseñas seguras que no vas a olvidar",
      category: "Seguridad",
      duration: "10 min",
      icon: "🔐",
      shortDesc: "El truco de las frases conocidas para crear claves fuertes sin tener que usar combinaciones raras imposibles.",
      steps: [
        {
          title: "1. El peligro de las claves comunes",
          text: "Nunca uses contraseñas como '123456', 'abuela123', tu fecha de nacimiento ni tu nombre de pila. Esas son las primeras que los estafadores prueban con programas automáticos.",
          tip: "🚫 Prohibido: Evitar números seguidos o tu propio año de nacimiento.",
          icon: "⚠️"
        },
        {
          title: "2. El truco de la frase querida",
          text: "Elige una frase que te guste mucho y toma la primera letra de cada palabra junto a un año especial y un signo. Ejemplo: 'Mi nieto Mateo nació en el 2018!' se convierte en: MnMne2018! Es casi imposible de hackear y muy fácil de recordar para ti.",
          tip: "🧠 Creatividad: Una frase que solo tú conozcas es tu mejor escudo.",
          icon: "💡"
        },
        {
          title: "3. Tu cuaderno de claves en casa",
          text: "Guarda un cuaderno exclusivo en un cajón seguro de tu casa donde anotes qué clave corresponde a cada servicio. Nunca dejes ese cuaderno a la vista de visitas extrañas ni lleves las claves anotadas en un papel dentro de la billetera.",
          tip: "📓 Seguridad física: El cuaderno en casa es más seguro que cualquier archivo digital.",
          icon: "📖"
        }
      ]
    },
    {
      id: "c3-2",
      level: 3,
      title: "Reconocer estafas y el 'cuento del tío' digital",
      category: "Seguridad",
      duration: "15 min",
      icon: "🛡️",
      shortDesc: "Detecta a tiempo mensajes falsos de bancos, premios de sorteos donde nunca jugaste y pedidos sospechosos de dinero.",
      steps: [
        {
          title: "1. La regla del banco: Nunca te piden claves",
          text: "Grábate esta frase en la memoria: Ningún banco, PAMI ni ANSES te va a mandar un mensaje pidiéndote tu clave, tu usuario o el código de tu tarjeta. Si alguien te pide eso, es 100% una estafa.",
          tip: "🛑 Alerta roja: Las claves son secretas y personales. Jamás se dicen en llamadas.",
          icon: "🏦"
        },
        {
          title: "2. Los premios 'mágicos' y las urgencias",
          text: "Los estafadores siempre usan dos armas: la promesa de un premio que no esperabas ('¡Ganaste un auto!') o el miedo urgente ('¡Tu cuenta se cerrará en 10 minutos!'). Quieren que actúes rápido sin pensar.",
          tip: "🧘 Frena un minuto: Ante cualquier mensaje alarmante, respira y no toques ningún enlace.",
          icon: "🎁"
        },
        {
          title: "3. La técnica de 'Llamar a la voz conocida'",
          text: "Si recibes un WhatsApp de un supuesto hijo o nieto diciendo 'Hola má, cambié de número, mandame plata', NO le transfieras nada. Agarra el teléfono y llama al número de siempre de tu familiar para escuchar su voz.",
          tip: "📞 Comprobación: Siempre llama por teléfono común antes de enviar dinero.",
          icon: "🗣️"
        }
      ]
    },
    {
      id: "c3-3",
      level: 3,
      title: "Privacidad y uso tranquilo de redes sociales",
      category: "Privacidad",
      duration: "12 min",
      icon: "🔒",
      shortDesc: "Cómo disfrutar de Facebook e Instagram para ver fotos de la familia sin exponer tu casa ni tu intimidad.",
      steps: [
        {
          title: "1. Quién puede ver lo que publicas",
          text: "En tus redes sociales, procura configurar tus publicaciones como 'Solo Amigos'. De esta manera, únicamente las personas que tú aceptaste podrán ver las fotos de tus nietos o tus paseos.",
          tip: "👥 Círculo íntimo: Es mejor compartir solo con personas que conoces en la vida real.",
          icon: "👀"
        },
        {
          title: "2. Qué cosas NUNCA se publican",
          text: "Nunca saques fotos de tu casa con el número de la calle visible, ni fotos de tu tarjeta de débito, recibos de jubilación o boletos de avión donde se vean las fechas en las que la casa quedará sola.",
          tip: "🏠 Prudencia: Los detalles de tu domicilio se mantienen siempre en privado.",
          icon: "⛔"
        },
        {
          title: "3. Solicitudes de amistad de desconocidos",
          text: "Si recibes una solicitud de una persona que no conoces, o de un supuesto famoso o militar extranjero que te halaga, elimínala sin miedo. No es de mala educación cuidar tu espacio personal.",
          tip: "❌ Eliminar sin culpa: Tu tranquilidad digital está por encima de todo.",
          icon: "🛡️"
        }
      ]
    }
  ],

  // SIMULADOR DE PLAY STORE (CURSO ESTRELLA)
  playStoreSimulator: {
    title: "Simulador Interactivo de Google Play Store",
    instructions: "Busca la aplicación oficial de 'PAMI' y descárgala siguiendo los pasos que aprendiste en la lección:",
    searchQuery: "PAMI",
    appsList: [
      {
        id: "pami-official",
        name: "PAMI Móvil",
        developer: "INSSJP - Instituto Nacional de Servicios Sociales",
        isOfficial: true,
        iconText: "🏥",
        rating: "4.7 ⭐ (125.000 opiniones)",
        downloads: "+5 Millones de descargas",
        badge: "✅ Verificada Oficial por Google",
        description: "Credencial digital médica, recetas electrónicas y solicitud de turnos sin hacer filas."
      },
      {
        id: "pami-fake",
        name: "PAMI Turnos Rápido (Patrocinado)",
        developer: "Publicidad Promo Games Ltd.",
        isOfficial: false,
        iconText: "⚠️",
        rating: "2.1 ⭐",
        downloads: "1.000 descargas",
        badge: "📢 Anuncio Patrocinado - No Oficial",
        description: "¡Cuidado! Esta aplicación no pertenece a PAMI y solicita pagos indebidos por adelantado."
      }
    ]
  },

  // EVALUACIÓN DE COMPROBACIÓN DE CONOCIMIENTOS (CURSO DE DESCARGA DE APPS)
  courseEvaluation: {
    courseTitle: "Evaluación Práctica: Descarga Segura de Aplicaciones",
    instructions: "Responde estas 3 preguntas para comprobar si realmente sabes descargar aplicaciones en tu celular sin caer en trampas. ¡Al aprobar recibirás tu Certificado Digital!",
    questions: [
      {
        id: "q1",
        question: "1. ¿Dónde debes buscar y descargar una aplicación para estar 100% seguro?",
        options: [
          { text: "Dentro de la tienda oficial de tu celular (Google Play Store o App Store)", correct: true },
          { text: "En un enlace que me llegó por mensaje de texto de un número desconocido", correct: false },
          { text: "En un anuncio que parpadea en una página de Internet diciendo 'Descargar aquí'", correct: false }
        ],
        explanation: "¡Correcto! La tienda oficial (Play Store) revisa las aplicaciones para que no tengan virus ni trampas. Nunca se debe descargar de mensajes de texto ni páginas raras."
      },
      {
        id: "q2",
        question: "2. Cuando buscas una aplicación como PAMI o tu Banco, ¿en qué te debes fijar antes de presionar 'Instalar'?",
        options: [
          { text: "Que tenga el nombre del organismo oficial, el tilde de verificación y millones de descargas", correct: true },
          { text: "Que tenga una etiqueta que diga 'Patrocinado' o 'Anuncio'", correct: false },
          { text: "No hay que fijarse en nada, todas las aplicaciones son iguales", correct: false }
        ],
        explanation: "¡Excelente! Los estafadores a veces pagan anuncios para aparecer primero. Fijarse en el nombre del creador oficial y las millones de descargas es la clave de oro."
      },
      {
        id: "q3",
        question: "3. Después de tocar el botón verde 'Instalar', ¿qué debes hacer mientras el círculo gira descargando?",
        options: [
          { text: "Esperar tranquilamente unos minutos sin tocar la pantalla con prisa hasta que diga 'Abrir'", correct: true },
          { text: "Apretar el botón muchas veces seguidas con fuerza para que baje más rápido", correct: false },
          { text: "Apagar el teléfono de golpe", correct: false }
        ],
        explanation: "¡Exacto! El teléfono descarga a través del Wi-Fi a su ritmo. Dejarlo tranquilo un par de minutos es la forma correcta de esperar a que finalice."
      }
    ]
  },

  // Simulador de Detección de Estafas
  scamScenarios: [
    {
      id: "scam-1",
      sender: "WhatsApp de un número desconocido (+54 9 11 ...)",
      messageText: "¡FELICITACIONES! Fuiste seleccionado por sorteo nacional y ganaste $850.000 pesos y un televisor Smart. Para coordinar la entrega HOY MISMO haz clic en este enlace urgente: http://premio-urgente-banco.xyz/cobrar y pasa tus datos de tarjeta.",
      isScam: true,
      difficulty: "Fácil",
      explanation: "¡Es una ESTAFA total! Nadie regala dinero en sorteos donde nunca te anotaste. Además, el enlace 'xyz' es falso y te piden datos de tu tarjeta bancaria. Nunca hagas clic.",
      warningClues: [
        "Premio sorpresa en sorteo donde no participaste.",
        "Te apuran diciendo 'hoy mismo' o 'urgente'.",
        "Enlace web raro y sospechoso.",
        "Te piden datos y claves de tus tarjetas."
      ]
    },
    {
      id: "scam-2",
      sender: "SMS Oficial del Hospital Vecinal",
      messageText: "Hospital San Lucas le recuerda: Su turno con Oftalmología es el Martes 15 a las 11:30 hs en Consultorio 4. Lleve su DNI y carnet de PAMI. Por consultas llame al 0800-444-HOSP.",
      isScam: false,
      difficulty: "Fácil",
      explanation: "¡Es un mensaje SEGURO! Es un recordatorio de un turno que tú solicitaste. No te piden contraseñas, no te mandan enlaces raros ni te piden que transfieras dinero.",
      warningClues: [
        "Solo te recuerda fecha y hora.",
        "Te pide que lleves tu DNI físico al consultorio.",
        "No te pide claves, dinero ni datos secretos."
      ]
    },
    {
      id: "scam-3",
      sender: "Correo / Mensaje que dice ser de 'TU BANCO'",
      messageText: "ALERTA BANCO: Detectamos una compra sospechosa en su cuenta por $120.000. Si no fue usted, ingrese a www.banco-desbloqueo-inmediato.com y coloque su clave y código de seguridad para cancelar el débito en 5 minutos.",
      isScam: true,
      difficulty: "Medio",
      explanation: "¡Es una ESTAFA (Phishing)! Los estafadores usan el susto de un cobro falso para que te asustes y les des tu contraseña. Tu banco real NUNCA te pide claves por mensaje ni correo para frenar una compra.",
      warningClues: [
        "Usan el miedo para que no pienses con claridad.",
        "Te dan un límite de 5 minutos para asustarte.",
        "Te piden poner tu clave en una página que no es la del banco."
      ]
    },
    {
      id: "scam-4",
      sender: "WhatsApp con foto de tu nieto/a",
      messageText: "Hola abuela!! Me robaron el teléfono y estoy en la comisaría incomunicado con este número prestado. Necesito urgente que me transfieras $45.000 a este alias para pagar el remís. ¡No le digas nada a mamá que se enoja!",
      isScam: true,
      difficulty: "Atención Especial",
      explanation: "¡Es el típico 'Cuento del Tío' digital! Robaron una foto de tu nieto de redes sociales para engañarte. Siempre te dicen que no le cuentes a nadie y piden plata urgente. Lo que debes hacer es llamar al número de siempre de tu nieto o de su mamá.",
      warningClues: [
        "Dice ser un familiar pero te escribe de un número nuevo.",
        "Te pide dinero urgente.",
        "Te pide que sea un secreto ('no le digas a mamá')."
      ]
    },
    {
      id: "scam-5",
      sender: "Mensaje de WhatsApp de la Farmacia del barrio",
      messageText: "Hola Don Carlos! Le avisamos de la Farmacia Belgrano que ya llegaron las gotas recetadas que nos encargó ayer. Puede pasar a retirarlas cuando guste de 9 a 20 hs. Saludos!",
      isScam: false,
      difficulty: "Fácil",
      explanation: "¡Es un mensaje SEGURO y amigable! Es la farmacia respondiendo a un pedido que tú hiciste. Te atienden por tu nombre, no te piden contraseñas y te invitan a ir al local comercial.",
      warningClues: [
        "Responde a algo que encargaste en persona.",
        "Te invita a pasar por el local.",
        "No pide claves ni transferencias por adelantado."
      ]
    }
  ],

  // Simulador de Chat Familiar (WhatsApp)
  chatSimulator: {
    contactName: "Sofía (Nieta)",
    contactStatus: "En línea",
    avatar: "👧",
    incomingMessage: "¡Hola abu! ¿Cómo estás? Vi que estabas aprendiendo en la compu hoy... ¿Pudiste entrar a la clase de Puente Digital? ❤️",
    options: [
      {
        id: "opt-1",
        text: "¡Hola Sofi querida! Sí, ya hice la primera lección y aprendí a usar el Wi-Fi.",
        botReply: "¡Qué genia abu!! 👏 Sabía que podías. La próxima te enseño a mandarme stickers graciosos jajaja. ¡Te quiero mucho! ❤️"
      },
      {
        id: "opt-2",
        text: "Hola mi vida. De a poquito le voy perdiendo el miedo, ¡es más fácil de lo que pensaba!",
        botReply: "¡Viste que sí! Con paciencia todo se aprende. El finde te visito y merendamos juntos mientras me mostrás tus avances. Un beso enorme! 🥰"
      },
      {
        id: "opt-3",
        text: "Hola hermosa. Me costó un poquito pero los profesores explican con letra bien grande.",
        botReply: "¡Qué bueno abu! La clave es no apurarse. Cualquier duda que tengas me mandás un audio y lo vemos juntos. ¡Te mando un abrazo apretado! 🤗"
      }
    ]
  },

  // Testimonios reales y motivadores
  testimonials: [
    {
      quote: "Pensé que a mis 73 años la tecnología no era para mí. En Puente Digital me enseñaron con paciencia, sin palabras raras, y hoy hago videollamadas con mis nietos que viven en el sur.",
      author: "Marta Elena, 73 años",
      location: "San Martín, Buenos Aires"
    },
    {
      quote: "Antes tenía que pedirle a mi hijo que me saque los turnos del médico. Ahora entro yo solo desde mi tablet y me guardo el comprobante. Me devolvió la independencia.",
      author: "Roberto Carlos, 69 años",
      location: "Rosario, Santa Fe"
    },
    {
      quote: "Lo que más me sirvió fue el taller de estafas. El otro día me llegó un mensaje que decía ser del banco y me di cuenta al toque de que era una trampa. Me salvé gracias a lo que aprendí acá.",
      author: "Graciela Beatriz, 76 años",
      location: "Córdoba Capital"
    }
  ],

  // --------------------------------------------------------------------------
  // NOVEDADES PUENTE DIGITAL 2.0: LOGROS, EMERGENCIAS SOS Y SIMULADORES AMPLIADOS
  // --------------------------------------------------------------------------

  // Catálogo de Logros Profesionales
  achievements: [
    {
      id: "ach-first-step",
      title: "Primer Paso Digital",
      category: "Iniciación",
      icon: "🏅",
      description: "Iniciaste sesión y diste tus primeros pasos en la plataforma Puente Digital.",
      unlockedNotice: "¡Felicitaciones! Has dado el paso más importante: animarte a empezar."
    },
    {
      id: "ach-device-master",
      title: "Conocí mi Dispositivo",
      category: "Nivel 1",
      icon: "📱",
      description: "Aprendiste a manejar la pantalla táctil, los botones y el teclado sin miedo.",
      unlockedNotice: "¡Excelente! Ya dominás los gestos suaves de tu pantalla."
    },
    {
      id: "ach-first-message",
      title: "Primer Mensaje Enviado",
      category: "Comunicación",
      icon: "💬",
      description: "Enviaste tu primer mensaje de texto en el simulador de WhatsApp.",
      unlockedNotice: "¡Qué emoción! Tu mensaje llegó sano y salvo a tu familiar."
    },
    {
      id: "ach-photo-shared",
      title: "Compartiendo Recuerdos",
      category: "Comunicación",
      icon: "📸",
      description: "Aprendiste a adjuntar y enviar una fotografía familiar por WhatsApp.",
      unlockedNotice: "¡Genial! Ahora podés compartir tus fotos más lindas."
    },
    {
      id: "ach-video-call",
      title: "Conectado en Familia",
      category: "Comunicación",
      icon: "🎥",
      description: "Realizaste o atendiste una videollamada para hablar cara a cara.",
      unlockedNotice: "¡Hermoso momento! La tecnología acorta distancias."
    },
    {
      id: "ach-app-installer",
      title: "Instalador Seguro",
      category: "Práctica",
      icon: "📥",
      description: "Descargaste e instalaste la aplicación de PAMI en el simulador de Play Store.",
      unlockedNotice: "¡Logro desbloqueado! Sabés buscar aplicaciones oficiales sin caer en anuncios."
    },
    {
      id: "ach-scam-shield",
      title: "Ojo Experto en Seguridad",
      category: "Seguridad",
      icon: "🛡️",
      description: "Detectaste correctamente los mensajes fraudulentos en el taller de estafas.",
      unlockedNotice: "¡Gran trabajo! Tus datos y tu tranquilidad están protegidos."
    },
    {
      id: "ach-digital-citizen",
      title: "Ciudadano Digital",
      category: "Certificación",
      icon: "🎓",
      description: "Aprobaste la evaluación final y obtuviste tu Certificado de Autonomía Digital.",
      unlockedNotice: "¡Orgullo total! Eres oficialmente un Ciudadano Digital Autónomo."
    },
    {
      id: "ach-ai-friend",
      title: "Compañero con IA",
      category: "Inteligencia Artificial",
      icon: "🤖",
      description: "Consultaste a tu Compañero con Inteligencia Artificial y recibiste una respuesta empática con voz.",
      unlockedNotice: "¡Felicitaciones! Conversaste con la Inteligencia Artificial y aprendiste un consejo nuevo."
    }
  ],

  // Guías Rápidas de Emergencia Digital (Botón SOS)
  emergencyHelp: [
    {
      id: "sos-card",
      title: "Me pidieron los datos o foto de mi tarjeta",
      badge: "Tarjeta y Banco",
      calmMessage: "Respirá hondo. Si todavía no diste el código de 3 números del reverso ni tus claves, no pasa nada.",
      steps: [
        "No respondas el mensaje ni continues la llamada.",
        "Si llegaste a dar números, llamá de inmediato al teléfono que figura atrás de tu tarjeta plástica real.",
        "Pedí que bloqueen temporalmente las compras por Internet."
      ],
      officialPhone: "Llamá al número de guardia de tu banco (o Red Link: 0800-888-5465 / Banelco: 011-4320-5000)"
    },
    {
      id: "sos-sms-code",
      title: "Me pidieron un código de 6 números que me llegó por SMS",
      badge: "Códigos Secretos",
      calmMessage: "Ese código es como la llave de tu casa. Nadie te lo puede pedir, ni siquiera un supuesto operador.",
      steps: [
        "Nunca le leas ni envíes ese código a nadie.",
        "Si te dicen que es para 'activar tu vacuna' o 'habilitar un subsidio', es mentira.",
        "Simplemente borrá el mensaje y bloqueá al número que te lo pidió."
      ],
      officialPhone: "Si dudás de un organismo oficial: PAMI Escucha (138) • ANSES (130)"
    },
    {
      id: "sos-urgent-money",
      title: "Un familiar me pide dinero urgente por WhatsApp con otro número",
      badge: "Cuento del Tío",
      calmMessage: "Es una trampa muy común. Los estafadores usan una foto de tu nieto o hijo de sus redes sociales.",
      steps: [
        "No transfieras ni un solo peso.",
        "No sigas respondiéndole a ese número nuevo.",
        "Llamá directamente al número de teléfono habitual que tenés agendado de tu familiar para escuchar su voz real."
      ],
      officialPhone: "Ante insistencia o amenazas llamá al 911 de emergencias policiales."
    },
    {
      id: "sos-lost-phone",
      title: "Perdí mi teléfono o me lo robaron",
      badge: "Dispositivo",
      calmMessage: "Mantené la calma. Tus datos están protegidos si tu teléfono tenía bloqueo de pantalla.",
      steps: [
        "Pedile a un familiar que llame a tu compañía de celular (Personal, Movistar o Claro) para suspender la línea.",
        "Entrá con la ayuda de un familiar a cambiar la contraseña de tu correo de Google y de tu cuenta de WhatsApp.",
        "Si tenías la app del banco, avisales por teléfono para pausar el acceso móvil."
      ],
      officialPhone: "Atención al cliente de telefonía móvil: *611 desde otra línea de la misma empresa"
    },
    {
      id: "sos-weird-message",
      title: "Recibí un mensaje muy extraño o un enlace desconocido",
      badge: "Mensajes Raros",
      calmMessage: "El mensaje no puede hacerte daño si no tocás el enlace.",
      steps: [
        "No toques ningún enlace que tenga letras raras o termine en .xyz, .top o .club.",
        "Mantené apretado el mensaje en WhatsApp y tocaló para 'Eliminar'.",
        "Tocá el número arriba y elegí 'Bloquear y reportar'."
      ],
      officialPhone: "Puente Digital Soporte: 0800-888-PUENTE"
    },
    {
      id: "sos-fake-website",
      title: "Entré a una página de Internet y me asusté",
      badge: "Navegación",
      calmMessage: "Si una página te dice '¡Tu teléfono tiene 5 virus!', es solo una propaganda engañosa para asustarte.",
      steps: [
        "Cerrá la pestaña tocando la cruz (✕) arriba en la pantalla.",
        "Si la pantalla se trabó, tocá el botón de inicio de tu celular (el circulito de abajo) para volver a tu pantalla principal.",
        "No descargues nada de lo que esa página te ofrecía."
      ],
      officialPhone: "Recordá: cerrar la pestaña soluciona el 99% de los avisos falsos."
    }
  ],

  // Simulaciones Ampliadas de WhatsApp 2.0
  extendedWhatsApp: {
    familyPhotos: [
      {
        id: "photo-grandkids",
        title: "Cumpleaños de los Nietos",
        icon: "🎂",
        caption: "¡Mirá abu qué linda foto del festejo del domingo en el parque!"
      },
      {
        id: "photo-garden",
        title: "Las Flores del Jardín",
        icon: "🌸",
        caption: "Las flores del patio que tanto te gustan ya florecieron."
      },
      {
        id: "photo-pet",
        title: "El Perrito Toby",
        icon: "🐶",
        caption: "Toby durmiendo la siesta en el sillón te manda un abrazo."
      }
    ],
    audioSimulator: {
      voiceDurationSeconds: 6,
      transcript: "¡Hola abu! Te mando un besote enorme. ¡Te quiero mucho!",
      replyText: "¡Qué lindo escucharte Sofi! Me alegra mucho el día tu voz."
    }
  },

  // Datos para Vista Acompañante / Panel Docente
  tutorCommunity: {
    centerName: "Centro de Día 'Los Abuelos Felices' & Taller Municipal",
    activeStudentsCount: 48,
    averageProgress: "68%",
    topStrengths: ["Uso de WhatsApp", "Búsqueda en Google", "Detector de Estafas"],
    needsSupport: ["Turnos PAMI en línea", "Descarga de Apps oficiales"],
    recentStudents: [
      { name: "Rony M.", level: "Nivel 2", completed: "5 lecciones", status: "Activo hoy", badge: "⭐ Destacado" },
      { name: "Marta E.", level: "Nivel 3", completed: "9 lecciones", status: "Ayer", badge: "🎓 Graduada" },
      { name: "Roberto C.", level: "Nivel 1", completed: "3 lecciones", status: "Hace 2 días", badge: "🌱 En camino" },
      { name: "Graciela B.", level: "Nivel 2", completed: "7 lecciones", status: "Hoy", badge: "🛡️ Experta" }
    ]
  }
};

if (typeof window !== 'undefined') {
  window.PUENTE_DATA = PUENTE_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PUENTE_DATA;
}

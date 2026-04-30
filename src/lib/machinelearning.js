// ============================================================
// MACHINE LEARNING PLANET — Itinerarios de Actividades
// ============================================================

// ─── ITINERARIO 1: LearningML (learningml.org) ──────────────
export const ML_LEARNINGML = [
  {
    id: 'lml-1', numero: 1,
    titulo: 'Análisis de Conducta',
    url: 'https://web.learningml.org/actividad-analisis-de-conductas/',
    externalUrl: 'https://web.learningml.org/actividad-analisis-de-conductas/',
    description: 'Crea un programa que analiza si una frase está escrita con buen o mal rollo y reacciona según el caso.',
    difficulty: 'Fácil', tags: ['texto', 'sentimientos', 'NLP']
  },
  {
    id: 'lml-2', numero: 2,
    titulo: 'Juego de Preguntas y Respuestas',
    url: 'https://web.learningml.org/juego-de-preguntas-y-respuestas/',
    externalUrl: 'https://web.learningml.org/juego-de-preguntas-y-respuestas/',
    description: 'Programa un juego de preguntas y respuestas sobre los periodos de la prehistoria usando reconocimiento de texto.',
    difficulty: 'Fácil', tags: ['texto', 'clasificación', 'juego']
  },
  {
    id: 'lml-3', numero: 3,
    titulo: 'El Imitador',
    url: 'https://web.learningml.org/actividad-imitador/',
    externalUrl: 'https://web.learningml.org/actividad-imitador/',
    description: 'Entrena un modelo que reconoce tus gestos a través de la cámara y los imita en pantalla.',
    difficulty: 'Fácil', tags: ['imagen', 'gestos', 'cámara']
  },
  {
    id: 'lml-4', numero: 4,
    titulo: 'Asistente Virtual',
    url: 'https://web.learningml.org/asistente-virtual',
    externalUrl: 'https://web.learningml.org/asistente-virtual',
    description: 'Usa lenguaje natural para ordenarle a Giga que encienda o apague una luz y un ventilador.',
    difficulty: 'Intermedio', tags: ['texto', 'asistente', 'comandos']
  },
  {
    id: 'lml-5', numero: 5,
    titulo: 'Filtrado de Imágenes',
    url: 'https://web.learningml.org/actividad-filtro-de-imagenes-inteligente/',
    externalUrl: 'https://web.learningml.org/actividad-filtro-de-imagenes-inteligente/',
    description: 'Crea un programa que filtra tipos de imágenes según lo que le pidas.',
    difficulty: 'Intermedio', tags: ['imagen', 'clasificación', 'filtro']
  },
  {
    id: 'lml-6', numero: 6,
    titulo: 'Piedra, Papel o Tijeras',
    url: 'https://web.learningml.org/actividad-piedra-papel-o-tijeras/',
    externalUrl: 'https://web.learningml.org/actividad-piedra-papel-o-tijeras/',
    description: 'Programa el clásico juego usando reconocimiento de gestos con la cámara.',
    difficulty: 'Avanzado', tags: ['imagen', 'gestos', 'juego', 'cámara']
  }
];

// ─── ITINERARIO 2: Machine Learning for Kids ────────────────
// Fuente: https://machinelearningforkids.co.uk/#!/worksheets
// Cada worksheet tiene su propia URL con el slug del proyecto.
// URL patrón: https://machinelearningforkids.co.uk/#!/worksheets/[slug]
// PATRÓN: https://github.com/IBM/taxinomitis-docs/raw/master/project-worksheets/pdf/worksheet-[slug]-es.pdf
const MLFK_PDF_ROOT = 'https://github.com/IBM/taxinomitis-docs/raw/master/project-worksheets/pdf';
const ws = (slug) => `${MLFK_PDF_ROOT}/worksheet-${slug}-es.pdf`;

export const ML_FOR_KIDS = {
  beginner: [
    {
      id: 'mlfk-b1', numero: 1,
      titulo: 'Make Me Happy',
      url: ws('makemehappy'),
      externalUrl: ws('makemehappy'),
      description: 'Enseña a un personaje a reconocer qué comentarios le hacen feliz o triste. Primera introducción al ML con texto.',
      tags: ['texto', 'emociones', 'Scratch']
    },
    {
      id: 'mlfk-b2', numero: 2,
      titulo: 'Classify Headlines',
      url: ws('headlines'),
      externalUrl: ws('headlines'),
      description: 'Entrena un modelo para clasificar titulares de noticias y crea un lector inteligente en Scratch.',
      tags: ['texto', 'clasificación', 'noticias']
    },
    {
      id: 'mlfk-b3', numero: 3,
      titulo: 'Smart Classroom',
      url: ws('smartclassroom-tryitnow'),
      externalUrl: ws('smartclassroom-tryitnow'),
      description: 'Crea un asistente de clase inteligente que responde preguntas frecuentes de los estudiantes.',
      tags: ['texto', 'asistente', 'educación']
    },
    {
      id: 'mlfk-b4', numero: 4,
      titulo: 'Mailman',
      url: ws('mailmanmax'),
      externalUrl: ws('mailmanmax'),
      description: 'Crea un cartero inteligente que clasifica el correo según su contenido.',
      tags: ['texto', 'clasificación', 'correo']
    },
    {
      id: 'mlfk-b5', numero: 5,
      titulo: 'Snap! The Shark',
      url: ws('snap'),
      externalUrl: ws('snap'),
      description: 'Enseña a un tiburón en Scratch a distinguir entre peces seguros y peligrosos usando imagen.',
      tags: ['imagen', 'clasificación', 'Scratch']
    },
    {
      id: 'mlfk-b6', numero: 6,
      titulo: 'Fruit Picker',
      url: ws('fooled'),
      externalUrl: ws('fooled'),
      description: 'Entrena un modelo que reconoce distintas frutas con la cámara. Primera aproximación a la visión artificial.',
      tags: ['imagen', 'clasificación', 'frutas']
    },
    {
      id: 'mlfk-b7', numero: 7,
      titulo: 'Judge a Book',
      url: ws('judgeabook'),
      externalUrl: ws('judgeabook'),
      description: 'Entrena un modelo que recomienda libros a partir de su portada.',
      tags: ['imagen', 'recomendación', 'libros']
    },
    {
      id: 'mlfk-b8', numero: 8,
      titulo: 'Noughts and Crosses',
      url: ws('noughtsandcrosses'),
      externalUrl: ws('noughtsandcrosses'),
      description: 'Entrena una IA para jugar al tres en raya. Aprende los fundamentos del aprendizaje supervisado.',
      tags: ['texto', 'juego', 'supervisado']
    },
  ],
  intermediate: [
    {
      id: 'mlfk-i1', numero: 1,
      titulo: 'Rock, Paper, Scissors',
      url: ws('rockpaperscissors'),
      externalUrl: ws('rockpaperscissors'),
      description: 'Entrena un modelo con imágenes de tu mano para que la IA aprenda a jugar piedra, papel o tijeras.',
      tags: ['imagen', 'gestos', 'juego']
    },
    {
      id: 'mlfk-i2', numero: 2,
      titulo: 'Chatbot',
      url: ws('chatbots'),
      externalUrl: ws('chatbots'),
      description: 'Crea tu propio chatbot que aprende a mantener conversaciones básicas entrenándolo con ejemplos.',
      tags: ['texto', 'chatbot', 'conversación']
    },
    {
      id: 'mlfk-i3', numero: 3,
      titulo: 'Sorting Hat',
      url: ws('sortinghat'),
      externalUrl: ws('sortinghat'),
      description: 'Recrea el Sombrero Seleccionador de Harry Potter que clasifica alumnos en casas.',
      tags: ['texto', 'clasificación', 'Harry Potter']
    },
    {
      id: 'mlfk-i4', numero: 4,
      titulo: 'Safer Spaces',
      url: ws('relevance'),
      externalUrl: ws('relevance'),
      description: 'Entrena un moderador de comentarios que detecta mensajes ofensivos. Aprende sobre ética en la IA.',
      tags: ['texto', 'moderación', 'ética']
    },
    {
      id: 'mlfk-i5', numero: 5,
      titulo: 'Weather',
      url: ws('touristinfo'),
      externalUrl: ws('touristinfo'),
      description: 'Crea un predictor del tiempo que usa datos históricos para aprender patrones climáticos.',
      tags: ['números', 'predicción', 'datos']
    },
    {
      id: 'mlfk-i6', numero: 6,
      titulo: 'Traffic',
      url: ws('findit'),
      externalUrl: ws('findit'),
      description: 'Entrena un modelo que controla semáforos inteligentes según el flujo de tráfico.',
      tags: ['números', 'tráfico', 'optimización']
    },
    {
      id: 'mlfk-i7', numero: 7,
      titulo: 'Titanic',
      url: ws('titanic-python'),
      externalUrl: ws('titanic-python'),
      description: 'Usa datos reales del Titanic para entrenar un modelo que predice la supervivencia de los pasajeros.',
      tags: ['números', 'datos reales', 'predicción']
    },
    {
      id: 'mlfk-i8', numero: 8,
      titulo: 'Phishing',
      url: ws('jargonbuster'),
      externalUrl: ws('jargonbuster'),
      description: 'Entrena un detector de webs peligrosas de phishing. Ciberseguridad con IA.',
      tags: ['texto', 'seguridad', 'phishing']
    },
    {
      id: 'mlfk-i9', numero: 9,
      titulo: 'Spam or Ham',
      url: ws('whattwitterthinks'),
      externalUrl: ws('whattwitterthinks'),
      description: 'Entrena un detector de spam que aprende a distinguir mensajes deseados de correo basura.',
      tags: ['texto', 'spam', 'filtro']
    },
    {
      id: 'mlfk-i10', numero: 10,
      titulo: 'Bees',
      url: ws('chameleon'),
      externalUrl: ws('chameleon'),
      description: 'Crea un clasificador que distingue abejas sanas de enfermas a partir de imágenes. Caso real de IA aplicada.',
      tags: ['imagen', 'ciencia', 'clasificación']
    },
  ],
  advanced: [
    {
      id: 'mlfk-a1', numero: 1,
      titulo: 'Top Trumps',
      url: ws('toptrumps'),
      externalUrl: ws('toptrumps'),
      description: 'Crea un juego de cartas inteligente que usa datos numéricos para que la IA tome decisiones estratégicas.',
      tags: ['números', 'juego', 'estrategia']
    },
    {
      id: 'mlfk-a2', numero: 2,
      titulo: 'Pac-Man',
      url: ws('pacman'),
      externalUrl: ws('pacman'),
      description: 'Programa un Pac-Man que aprende a moverse evitando fantasmas usando aprendizaje por refuerzo.',
      tags: ['juego', 'refuerzo', 'Scratch']
    },
    {
      id: 'mlfk-a3', numero: 3,
      titulo: 'Car or Cup',
      url: ws('carorcup'),
      externalUrl: ws('carorcup'),
      description: 'Construye un clasificador de imágenes avanzado que distingue coches de tazas.',
      tags: ['imagen', 'clasificación', 'precisión']
    },
    {
      id: 'mlfk-a4', numero: 4,
      titulo: 'Crowdsourcing',
      url: ws('carorcup'),
      externalUrl: ws('carorcup'),
      description: 'Aprende cómo se etiquetan masivamente los datos de entrenamiento en proyectos colaborativos.',
      tags: ['datos', 'etiquetado', 'colaboración']
    },
    {
      id: 'mlfk-a5', numero: 5,
      titulo: 'Predict Scores',
      url: ws('pokemonstats'),
      externalUrl: ws('pokemonstats'),
      description: 'Entrena una IA para predecir resultados de partidos usando estadísticas históricas.',
      tags: ['números', 'predicción', 'deporte']
    },
    {
      id: 'mlfk-a6', numero: 6,
      titulo: 'Bias',
      url: ws('judgeabook'),
      externalUrl: ws('judgeabook'),
      description: 'Explora el sesgo en los algoritmos de IA: cómo surge, por qué es perjudicial y cómo mitigarlo.',
      tags: ['ética', 'sesgo', 'reflexión']
    },
    {
      id: 'mlfk-a7', numero: 7,
      titulo: 'Draw',
      url: ws('handgestures'),
      externalUrl: ws('handgestures'),
      description: 'Crea una IA que reconoce dibujos a mano alzada al estilo Quick Draw de Google.',
      tags: ['imagen', 'dibujo', 'reconocimiento']
    },
    {
      id: 'mlfk-a8', numero: 8,
      titulo: 'Newspaper Layout',
      url: ws('headlines'),
      externalUrl: ws('headlines'),
      description: 'Diseña un sistema de maquetación automática de periódicos usando reconocimiento de imágenes.',
      tags: ['imagen', 'diseño', 'automatización']
    },
  ]
};

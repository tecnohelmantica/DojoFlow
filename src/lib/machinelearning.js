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

export const ML_FOR_KIDS = [
  {
    id: 'mlfk-hub', numero: 1,
    titulo: 'Página de Actividades (Worksheets)',
    url: 'https://machinelearningforkids.co.uk/#!/worksheets',
    externalUrl: 'https://machinelearningforkids.co.uk/#!/worksheets',
    description: 'Accede a todos los retos de Machine Learning for Kids. IMPORTANTE: Selecciona primero el nivel (Beginner, Intermediate o Advanced) o filtra por tipo de entrenamiento (Texto, Imagen, Números o Sonido) para encontrar el proyecto que más te guste.',
    difficulty: 'Variable', tags: ['MLFK', 'Hub', 'Actividades']
  }
];


const codeOrgLink = (i) =>
  `https://studio.code.org/courses/csd-web-dev-beta-2024/units/1/lessons/${i}/levels/1?section_id=6439783`;

const jsLink = (id) => `https://learnjavascript.online/app.html?id=${id}`;

// ─── JAVASCRIPT: Learn JavaScript Online (learnjavascript.online) ─────────────
// Atribución: Jad Joubran – https://learnjavascript.online
export const JS_LEARN_COURSE = [
  {
    id: 501,
    numero: 1,
    titulo: 'Curso de JavaScript (Jad Joubran)',
    description: 'Aprende JavaScript de forma progresiva e interactiva. Completa el curso a tu ritmo directamente en la plataforma.',
    url: 'https://learnjavascript.online/app.html?id=1435'
  }
];

// ─── FREECODECAMP: Certificaciones Web ───────────────────────────────────────
export const FCC_HTML_COURSE = [
  {
    id: 'fcc-html-1',
    numero: 1,
    titulo: 'Certificación Responsive Web Design',
    description: 'Aprende los lenguajes fundamentales de la web y obtén tu certificación oficial de FreeCodeCamp. Sube aquí tu certificado (o captura) al terminar para que sea validado por tu profesor.',
    url: 'https://www.freecodecamp.org/espanol/learn/responsive-web-design-v9/'
  }
];

export const FCC_JS_COURSE = [
  {
    id: 'fcc-js-1',
    numero: 1,
    titulo: 'Certificación JavaScript Algorithms',
    description: 'Aprende algoritmos y estructuras de datos en JavaScript y obtén tu certificación oficial de FreeCodeCamp. Sube aquí tu certificado (o captura) al terminar para que sea validado.',
    url: 'https://www.freecodecamp.org/espanol/learn/javascript-v9/'
  }
];

// ─── ACADEMY: Code.org Web Dev Unit 1 (21 lecciones) ─────────────────────────
export const HTML_CODE_ORG = [
  { id: 401, numero: 1,  titulo: 'Lección 1: Exploring Web Pages',         description: 'Explora cómo funcionan las páginas web y su propósito.',        url: codeOrgLink(1)  },
  { id: 402, numero: 2,  titulo: 'Lección 2: Intro to HTML',               description: 'Aprende las etiquetas básicas de HTML.',                         url: codeOrgLink(2)  },
  { id: 403, numero: 3,  titulo: 'Lección 3: Headings and Lists',          description: 'Uso de encabezados y listas para organizar información.',        url: codeOrgLink(3)  },
  { id: 404, numero: 4,  titulo: 'Lección 4: Digital Footprint',           description: 'Comprende tu huella digital y la seguridad en la web.',         url: codeOrgLink(4)  },
  { id: 405, numero: 5,  titulo: 'Lección 5: Mini-Project: HTML Web Page', description: 'Crea tu primera página web completa usando solo HTML.',         url: codeOrgLink(5)  },
  { id: 406, numero: 6,  titulo: 'Lección 6: Styling Text with CSS',       description: 'Primeros pasos con CSS para dar estilo al texto.',              url: codeOrgLink(6)  },
  { id: 407, numero: 7,  titulo: 'Lección 7: Intellectual Property',       description: 'Derechos de autor y uso ético de recursos en la web.',          url: codeOrgLink(7)  },
  { id: 408, numero: 8,  titulo: 'Lección 8: Using Images',                description: 'Cómo añadir y optimizar imágenes en tu sitio web.',             url: codeOrgLink(8)  },
  { id: 409, numero: 9,  titulo: 'Lección 9: Styling Elements with CSS',   description: 'Controla colores, bordes y fondos con CSS.',                   url: codeOrgLink(9)  },
  { id: 410, numero: 10, titulo: 'Lección 10: Mini-Project: Adding Style', description: 'Añade un diseño profesional a tu proyecto web.',               url: codeOrgLink(10) },
  { id: 411, numero: 11, titulo: 'Lección 11: CSS Classes',                description: 'Uso de clases para reutilizar estilos en múltiples elementos.', url: codeOrgLink(11) },
  { id: 412, numero: 12, titulo: 'Lección 12: The Box Model',              description: 'Comprende el margen, el borde y el relleno de los elementos.',  url: codeOrgLink(12) },
  { id: 413, numero: 13, titulo: 'Lección 13: Web Media Policy',           description: 'Políticas de uso de medios y accesibilidad.',                   url: codeOrgLink(13) },
  { id: 414, numero: 14, titulo: 'Lección 14: Mini-Project: Portfolio',    description: 'Empieza a construir tu portfolio personal.',                    url: codeOrgLink(14) },
  { id: 415, numero: 15, titulo: 'Lección 15: Layout and Flexbox',         description: 'Aprende a posicionar elementos usando Flexbox.',                url: codeOrgLink(15) },
  { id: 416, numero: 16, titulo: 'Lección 16: Links and Navigation',       description: 'Crea menús y enlaces entre diferentes páginas.',                url: codeOrgLink(16) },
  { id: 417, numero: 17, titulo: 'Lección 17: Multi-Page Websites',        description: 'Estructura sitios web con múltiples archivos HTML.',            url: codeOrgLink(17) },
  { id: 418, numero: 18, titulo: 'Lección 18: Project: Web Development',   description: 'Desarrollo final de tu sitio web personal.',                   url: codeOrgLink(18) },
  { id: 419, numero: 19, titulo: 'Lección 19: Peer Review and Feedback',   description: 'Revisión por pares y mejora iterativa del proyecto.',          url: codeOrgLink(19) },
  { id: 420, numero: 20, titulo: 'Lección 20: Publishing Your Website',    description: 'Cómo publicar y compartir tu sitio web con el mundo.',         url: codeOrgLink(20) },
  { id: 421, numero: 21, titulo: 'Lección 21: Presentation',               description: 'Presentación final de los proyectos.',                         url: codeOrgLink(21) },
];

// ─── RASPBERRY PI Nivel 1 — BÁSICO (11 proyectos verificados de la imagen) ───
// Source: projects.raspberrypi.org/en/technology/web_development → Level 1
export const RASPBERRY_WEB_LEVEL_1 = [
  { id: 'about-me', numero: 1,  titulo: 'About Me',           description: 'Haz un sitio web sobre ti mismo usando HTML y CSS.',                      url: 'https://projects.raspberrypi.org/en/projects/about-me'           },
  { id: 'anime-expressions', numero: 2,  titulo: 'Anime Expressions',  description: 'Crea y anima un personaje de anime con CSS.',                            url: 'https://projects.raspberrypi.org/en/projects/anime-expressions'  },
  { id: 'bird-watch-website', numero: 3,  titulo: 'Bird Watch Website 1.0', description: 'Crea tu primera web de observación de aves.',                        url: 'https://projects.raspberrypi.org/en/projects/bird-watch-website' },
  { id: 'build-a-robot', numero: 4,  titulo: 'Build a Robot',      description: 'Diseña un robot con formas y colores CSS.',                              url: 'https://projects.raspberrypi.org/en/projects/build-a-robot'      },
  { id: 'happy-birthday', numero: 5,  titulo: 'Happy Birthday',     description: 'Una tarjeta de felicitación interactiva con CSS.',                       url: 'https://projects.raspberrypi.org/en/projects/happy-birthday'     },
  { id: 'magazine', numero: 6,  titulo: 'Magazine',           description: 'Crea una página web con diseño de revista usando CSS Grid.',             url: 'https://projects.raspberrypi.org/en/projects/magazine'           },
  { id: 'pixel-art', numero: 7,  titulo: 'Pixel Art',          description: 'Crea un editor de pixel art con CSS Grid.',                             url: 'https://projects.raspberrypi.org/en/projects/pixel-art'          },
  { id: 'recipe', numero: 8,  titulo: 'Recipe',             description: 'Diseña tu receta favorita con HTML y CSS.',                             url: 'https://projects.raspberrypi.org/en/projects/recipe'             },
  { id: 'sunrise', numero: 9,  titulo: 'Sunrise',            description: 'Animación CSS de un amanecer con @keyframes.',                          url: 'https://projects.raspberrypi.org/en/projects/sunrise'            },
  { id: 'tell-a-story', numero: 10, titulo: 'Tell a Story',       description: 'Escribe una historia interactiva con múltiples páginas.',               url: 'https://projects.raspberrypi.org/en/projects/tell-a-story'       },
  { id: 'wanted', numero: 11, titulo: 'Wanted!',            description: 'Crea un póster "Se busca" para un personaje con HTML y CSS.',           url: 'https://projects.raspberrypi.org/en/projects/wanted'             },
];

// ─── RASPBERRY PI Nivel 2 — INTERMEDIO (10 proyectos verificados de la imagen) ─
// Source: projects.raspberrypi.org/en/technology/web_development → Level 2
export const RASPBERRY_WEB_LEVEL_2 = [
  { id: 'animated-story', numero: 1,  titulo: 'Animated Story',     description: 'Usa JavaScript para añadir efectos a una historia animada.',            url: 'https://projects.raspberrypi.org/en/projects/animated-story'    },
  { id: 'boat-race', numero: 2,  titulo: 'Boat Race',          description: 'Un juego simple de carreras de barcos con CSS y JavaScript.',          url: 'https://projects.raspberrypi.org/en/projects/boat-race'          },
  { id: 'chatbot', numero: 3,  titulo: 'Chatbot',            description: 'Simula un chatbot simple con JavaScript.',                             url: 'https://projects.raspberrypi.org/en/projects/chatbot'            },
  { id: 'comic-character', numero: 4,  titulo: 'Comic Character',    description: 'Diseña un personaje de cómic con CSS avanzado.',                       url: 'https://projects.raspberrypi.org/en/projects/comic-character'    },
  { id: 'mystery-letter', numero: 5,  titulo: 'Mystery Letter',     description: 'Crea una carta misteriosa con estilo de recorte de periódico.',        url: 'https://projects.raspberrypi.org/en/projects/mystery-letter'     },
  { id: 'pick-your-favourite', numero: 6,  titulo: 'Pick Your Favourite',description: 'Crea una web de votación de tus cosas favoritas.',                    url: 'https://projects.raspberrypi.org/en/projects/pick-your-favourite'},
  { id: 'quiz-time', numero: 7,  titulo: 'Quiz Time!',         description: 'Crea un cuestionario interactivo con JavaScript.',                     url: 'https://projects.raspberrypi.org/en/projects/quiz-time'          },
  { id: 'share-your-world', numero: 8,  titulo: 'Share Your World',   description: 'Construye un sitio web interactivo para compartir tu mundo.',          url: 'https://projects.raspberrypi.org/en/projects/share-your-world'   },
  { id: 'stickers', numero: 9,  titulo: 'Stickers!',          description: 'Diseña stickers divertidos con CSS avanzado.',                        url: 'https://projects.raspberrypi.org/en/projects/stickers'           },
  { id: 'talk-like-a-pirate', numero: 10, titulo: 'Talk Like a Pirate', description: 'Crea una web que traduzca texto al habla pirata con JavaScript.',      url: 'https://projects.raspberrypi.org/en/projects/talk-like-a-pirate' },
];

// ─── RASPBERRY PI Nivel 3 — AVANZADO (6 proyectos verificados de la imagen) ──
// Source: projects.raspberrypi.org/en/technology/web_development → Level 3
export const RASPBERRY_WEB_LEVEL_3 = [
  { id: 'build-a-webpage', numero: 1, titulo: 'Build a Webpage',     description: 'Lleva tu diseño web a un nivel superior.',                             url: 'https://projects.raspberrypi.org/en/projects/build-a-webpage'    },
  { id: 'mood-board', numero: 2, titulo: 'Mood Board',          description: 'Crea un tablero de moodboard interactivo con HTML y CSS.',             url: 'https://projects.raspberrypi.org/en/projects/mood-board'         },
  { id: 'sell-me-something', numero: 3, titulo: 'Sell Me Something',   description: 'Diseña una página web de producto o servicio.',                        url: 'https://projects.raspberrypi.org/en/projects/sell-me-something'  },
  { id: 'welcome-to-aotearoa', numero: 4, titulo: 'Welcome to Aotearoa', description: 'Usa CSS para hacer un sitio web creativo sobre Nueva Zelanda.',        url: 'https://projects.raspberrypi.org/en/projects/welcome-to-aotearoa'},
  { id: 'flip-treat-webcards', numero: 5, titulo: 'Flip Treat Selector', description: 'Aplica animaciones avanzadas y manipulación del DOM con JavaScript.',  url: 'https://projects.raspberrypi.org/en/projects/flip-treat-webcards'},
  { id: 'persuasive-page', numero: 6, titulo: 'Persuasive Page',     description: 'Crea una página web persuasiva con diseño profesional.',              url: 'https://projects.raspberrypi.org/en/projects/persuasive-page'    },
];

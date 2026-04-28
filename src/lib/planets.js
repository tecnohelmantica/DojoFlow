// src/lib/planets.js
export const PLANETS = [
  { 
    id: 'code', 
    name: 'Code.org', 
    image: '/planets/code.png', 
    icon: 'MonitorPlay',
    color: '#e8fffc', 
    barColor: '#128989', 
    url: 'https://studio.code.org/courses/express-2025/units/1?redirect_warning=true', 
    notebook: '77fcaf3a-3696-44b7-9e9e-d972df69c5c6', 
    subtitle: 'Fundamentos del pensamiento computacional.',
    description: 'Academia Digital: Fundamentos del pensamiento computacional y proyectos avanzados.',
    recommendation: 'Elige entre los Cursos Modernos, la Hora del Código o explora retos avanzados de IA.',
    buttons: [
      { label: 'CODE.ORG OFICIAL', url: 'https://studio.code.org/', color: 'teal' }
    ],
    tips: [
      "Lee siempre las instrucciones del puzzle antes de empezar a arrastrar bloques.",
      "Usa el botón 'Paso' para depurar tu código y ver qué hace cada bloque.",
      "Los bloques de color rosa suelen ser bucles que te ayudan a ahorrar código."
    ]
  },
  { 
    id: 'scratch', 
    name: 'Scratch', 
    image: '/planets/scratch.png', 
    icon: 'Puzzle',
    color: '#fff3e0', 
    barColor: '#ff9800', 
    url: 'https://scratch.mit.edu/projects/editor/', 
    notebook: '7bd104fa-d899-40b1-a902-1837e5daadaa',
    subtitle: 'Programación visual por bloques creativos.',
    description: 'Crea historias, juegos y animaciones compartiéndolas con todo el mundo.',
    recommendation: 'Misión Inicial: Completa los tutoriales (Haz clic en CREAR y luego en TUTORIALES).',
    studioMaterials: [
      { type: 'video', title: '¿Qué es Scratch?', url: 'https://notebooklm.google.com/notebook/7bd104fa-d899-40b1-a902-1837e5daadaa?artifactId=50eb257a-97bb-41bc-b5b4-d57b54a67500' },
      { type: 'presentation', title: 'Scratch Programming Essentials', url: 'https://notebooklm.google.com/notebook/7bd104fa-d899-40b1-a902-1837e5daadaa?artifactId=ca07e5f4-3b63-4782-bfd0-6db7d45879ab' },
      { type: 'infographic', title: 'Programación creativa con bloques visuales', url: 'https://notebooklm.google.com/notebook/7bd104fa-d899-40b1-a902-1837e5daadaa?artifactId=5cfb3e4b-76b9-436f-ba92-a16999bba7cc' }
    ],
    buttons: [
      { label: 'SCRATCH OFICIAL', url: 'https://scratch.mit.edu/projects/editor/', color: 'teal' }
    ],
    tips: [
      "Nombra tus objetos (sprites) para que tu código sea más fácil de entender.",
      "Usa mensajes (Enviar/Al recibir) para coordinar acciones entre distintos objetos.",
      "Puedes usar la extensión 'Lápiz' para dibujar patrones geométricos increíbles."
    ]
  },
  { 
    id: 'makecode-microbit', 
    name: 'Makecode micro:bit', 
    image: '/planets/microbit.jpeg', 
    icon: 'Cpu',
    color: '#e0f5f5', 
    barColor: '#00878a', 
    url: 'https://makecode.microbit.org/', 
    notebook: '48f2d3dc-43a3-43c8-8978-cc403c52ae64', 
    subtitle: 'Arquitectura de hardware y placas lógicas.',
    description: 'Aprende a programar hardware real con la placa micro:bit de la BBC. ¡Inicia sesión para guardar tu progreso!',
    recommendation: 'Misión: Inicia sesión en MakeCode y completa los tutoriales básicos antes de saltar a los proyectos ninja.',
    studioMaterials: [
      { type: 'video', title: '¿Qué es micro:bit?', url: 'https://notebooklm.google.com/notebook/48f2d3dc-43a3-43c8-8978-cc403c52ae64?artifactId=683622eb-eab1-4b08-906f-e2828a26f1fa' },
      { type: 'presentation', title: 'micro:bit Program the World', url: 'https://notebooklm.google.com/notebook/48f2d3dc-43a3-43c8-8978-cc403c52ae64?artifactId=96cfa98b-7000-47de-b6dc-d78909873d63' },
      { type: 'infographic', title: 'Guía de la microcomputadora programable', url: 'https://notebooklm.google.com/notebook/48f2d3dc-43a3-43c8-8978-cc403c52ae64?artifactId=2e9d3f3a-03a7-4d7d-a417-6b7df10f1517' }
    ],
    buttons: [
      { label: 'MAKECODE OFICIAL', url: 'https://makecode.microbit.org/', color: 'teal' }
    ],
    challengesUrls: {
      beginner: 'https://microbit.org/es-es/projects/make-it-code-it/?filters=beginner%2Cmakecode',
      intermediate: 'https://microbit.org/es-es/projects/make-it-code-it/?filters=intermediate%2Cmakecode',
      advanced: 'https://microbit.org/es-es/projects/make-it-code-it/?filters=advanced%2Cmakecode'
    }
  },
  { 
    id: 'makecode-arcade', 
    name: 'MakeCode Arcade', 
    image: '/planets/makecode%20arcade.jpeg', 
    icon: 'Gamepad2',
    color: '#fde7f3', 
    barColor: '#d81b60', 
    url: 'https://arcade.makecode.com/', 
    notebook: '8847c8f9-03ed-4588-ba40-5ebd720d2396', 
    subtitle: 'Diseño de videojuegos retro.',
    description: 'Crea tus propios videojuegos estilo arcade y juégalos en consolas reales. ¡Pasa de jugador a creador!',
    recommendation: 'Misión: Inicia sesión para guardar tus juegos. Te recomiendo empezar con el tutorial "Chase the Pizza" para dominar los sprites.',
    studioMaterials: [
      { type: 'video', title: '¿Qué es MakeCode Arcade?', url: 'https://notebooklm.google.com/notebook/8847c8f9-03ed-4588-ba40-5ebd720d2396?artifactId=17d73265-39c1-4f93-af8b-2de03ea526bd' },
      { type: 'presentation', title: 'MakeCode Arcade Level Up', url: 'https://notebooklm.google.com/notebook/8847c8f9-03ed-4588-ba40-5ebd720d2396?artifactId=350f8273-8c49-4f53-848f-fc51a8a7f9be' },
      { type: 'infographic', title: 'Guía de creación de videojuegos', url: 'https://notebooklm.google.com/notebook/8847c8f9-03ed-4588-ba40-5ebd720d2396?artifactId=2e9d3f3a-03a7-4d7d-a417-6b7df10f1517' }
    ],
    buttons: [
      { label: 'MAKECODE ARCADE OFICIAL', url: 'https://arcade.makecode.com/', color: 'pink' }
    ]
  },
  { 
    id: 'tinkercad', 
    name: 'Diseño 3D', 
    image: '/planets/3D.jpeg', 
    icon: 'Box',
    color: '#fff9e6', 
    barColor: '#ffc107', 
    url: 'https://www.tinkercad.com/', 
    notebook: 'ce0d46b5-6ece-42fd-bead-11b1868bf5a8', 
    subtitle: 'Modelado espacial algorítmico y bloques de código.',
    description: 'Diseña objetos en 3D para impresión o proyectos virtuales usando herramientas manuales o algoritmos.',
    recommendation: 'Misión: Completa los tutoriales de la Academia antes de empezar los Retos Ninja.',
    studioMaterials: [
      { type: 'presentation', title: 'Tinkercad 3D Design Workshop', url: 'https://notebooklm.google.com/notebook/ce0d46b5-6ece-42fd-bead-11b1868bf5a8?artifactId=06913914-ce8f-4ac4-9873-89ea06bb4efb' },
      { type: 'infographic', title: 'Guía de diseño en 3D', url: 'https://notebooklm.google.com/notebook/ce0d46b5-6ece-42fd-bead-11b1868bf5a8?artifactId=02ee7302-3c10-4ed3-b6c8-f998acc30b91' },
      { type: 'video', title: 'Diseño 3D con Tinkercad', url: 'https://notebooklm.google.com/notebook/ce0d46b5-6ece-42fd-bead-11b1868bf5a8?artifactId=96946ba4-72a8-468a-a6e1-98c21b6788bc' }
    ],
    buttons: [
      { label: 'TINKERCAD (3D)', url: 'https://www.tinkercad.com/dashboard', color: 'yellow' },
      { label: 'BLOCKSCAD OFICIAL', url: 'https://www.blockscad3d.com/editor/?lang=es#', color: 'black-outline', icon: 'Box' }
    ],
    tips: [
      "Usa el botón derecho del ratón para orbitar tu diseño y ver todos los ángulos.",
      "La tecla 'W' activa el plano de trabajo auxiliar para colocar objetos en caras inclinadas.",
      "Agrupa objetos (Ctrl+G) para crear formas complejas a partir de piezas simples.",
      "Usa la regla (tecla 'R') para posicionar tus objetos con precisión milimétrica."
    ]
  },
  { 
    id: 'arduino', 
    name: 'Arduino', 
    image: '/planets/arduino.png', 
    icon: 'Cpu',
    color: '#e6f7ff', 
    barColor: '#0097e6', 
    url: 'https://www.tinkercad.com/dashboard?type=circuits', 
    notebook: '967f99ef-b072-4163-95d2-a9a7d2d982f6', 
    subtitle: 'Robótica y electrónica textual.',
    description: 'Programación de microcontroladores y circuitos electrónicos.',
    recommendation: 'En este sector usamos C++ textual. Puedes programar en línea con Tinkercad o Wokwi, o usar el IDE de Arduino oficial instalado en tu ordenador para proyectos físicos.',
    buttons: [
      { label: 'TINKERCAD CIRCUITS', url: 'https://www.tinkercad.com/dashboard?type=circuits', color: 'teal' },
      { label: 'WOKWI SIMULATOR', url: 'https://wokwi.com/arduino', color: 'blue' }
    ],
    attribution: "Contenidos y retos adaptados de: Angel Micelti (angelmicelti.github.io), Luis Llamas (luisllamas.es), Makinando (makinando.github.io), Lope González (lopegonzalez.es) y Autodesk Tinkercad Circuits."
  },
  { 
    id: 'appinventor', 
    name: 'App Inventor', 
    image: '/planets/app%20inventor.png', 
    icon: 'Smartphone',
    color: '#e6ffec', 
    barColor: '#00cc55', 
    url: 'https://ai2.appinventor.mit.edu/', 
    notebook: '0140cffe-b3f5-4b83-bec3-f3639c156757', 
    subtitle: 'Creación de aplicaciones móviles.',
    description: 'Desarrolla aplicaciones para Android y iOS usando bloques.',
    recommendation: 'Necesitarás un dispositivo real o el emulador para ver tus apps funcionar.'
  },
  { 
    id: 'ia', 
    name: 'LearningML', 
    image: '/planets/learningml.png', 
    icon: 'Brain',
    color: '#f5e6ff', 
    barColor: '#9c27b0', 
    url: 'https://www.learningml.org/editor/', 
    notebook: '468cee10-db1f-43b9-b063-bad9f37bcf45', 
    subtitle: 'Entrenamiento de modelos de IA.',
    description: 'Descubre cómo las máquinas aprenden entrenando tus propios modelos.',
    recommendation: 'Empieza con el reconocimiento de imágenes: es lo más visual y divertido.'
  },
  { 
    id: 'python', 
    name: 'Python', 
    image: '/planets/python.png', 
    icon: 'Code',
    color: '#e8f1f8', 
    barColor: '#306998', 
    textStroke: '0.5px #306998', 
    titleGradient: 'linear-gradient(90deg, #306998, #ffd43b)',
    url: 'https://replit.com', 
    notebook: '107d8e9a-01c2-4b96-8a45-2b77e63e213b', 
    subtitle: 'Scripting planetario y backend.',
    description: 'Lenguaje de programación profesional para ciencia de datos y web.',
    recommendation: 'Domina los tipos de datos básicos antes de saltar a las funciones.',
    buttons: [
      { label: 'TRINKET (EDITOR)', url: 'https://trinket.io/python3', color: 'teal' },
      { label: 'REPLIT (PRO)', url: 'https://replit.com', color: 'blue' },
      { label: 'CODING FOR KIDS', url: 'https://codingforkids.io/es', color: 'pink' },
      { label: 'FREECODECAMP', url: 'https://www.freecodecamp.org/espanol/learn/python-v9/', color: 'teal' }
    ],
    attribution: "Contenidos y retos adaptados de: Picuino (picuino.com), Luis Llamas (luisllamas.es), Silent Teacher, Raspberry Pi Foundation, Coding for Kids, Codedex y FreeCodeCamp."
  },
  { 
    id: 'html', 
    name: 'HTML / CSS / JS', 
    image: '/planets/html.jpg', 
    icon: 'Globe',
    color: '#fff5f2', 
    barColor: '#e44d26', 
    url: 'https://codepen.io/pen/', 
    notebook: '6007d3b0-a4c5-4785-8310-8b259f04b28a', 
    subtitle: 'Construcción de Front-end.',
    description: 'Crea la estructura y el estilo de la web moderna.',
    recommendation: 'CSS es la clave para que tu web se vea profesional. ¡No le tengas miedo!',
    buttons: [
      { label: 'CodePen', url: 'https://codepen.io/pen/', color: 'teal', icon: 'ExternalLink' }
    ],
    attribution: "Contenidos y retos adaptados de: Luis Llamas (luisllamas.es), CodePen y MDN Web Docs."
  },
];

export const getPlanetById = (id) => {
  return PLANETS.find(p => p.id === id?.toLowerCase()) || null;
};

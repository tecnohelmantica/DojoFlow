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
    notebook: '7829705a-3870-4966-880c-99c0dae830c2', 
    subtitle: 'Fundamentos del pensamiento computacional.',
    description: 'Academia Digital: Fundamentos del pensamiento computacional y proyectos avanzados.',
    recommendation: 'Elige "CURSO EXPRESS" para empezar o "RETOS 11+" para crear apps reales.',
    buttons: [
      { label: 'CURSO EXPRESS', url: 'https://studio.code.org/courses/express-2025/units/1?redirect_warning=true', color: 'teal' },
      { label: 'RETOS 11+', url: 'https://code.org/es-ES/students/middle-and-high-school', color: 'purple', icon: 'Sparkles' }
    ],
    noChallenges: true 
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
      { label: 'ENTRAR AL PLANETA', url: 'https://scratch.mit.edu/projects/editor/', color: 'teal' },
      { label: 'VER TUTORIALES', url: 'https://scratch.mit.edu/projects/editor/?tutorial=all', color: 'purple', icon: 'Play' }
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
      { label: 'ENTRAR AL PLANETA', url: 'https://makecode.microbit.org/', color: 'teal' },
      { label: 'TUTORIALES', url: 'https://makecode.microbit.org/#tutorials', color: 'purple', icon: 'Play' }
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
      { label: 'ENTRAR AL PLANETA', url: 'https://arcade.makecode.com/', color: 'orange' },
      { label: 'TUTORIALES', url: 'https://arcade.makecode.com/#tutorials', color: 'purple', icon: 'Play' }
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
    subtitle: 'Modelado espacial algorítmico.',
    description: 'Diseña objetos en 3D para impresión o proyectos virtuales. ¡Convierte tus ideas en realidad tridimensional!',
    recommendation: 'Misión: Completa los 5 objetivos de la Academia antes de empezar los Retos Ninja de modelado técnico.',
    studioMaterials: [
      { type: 'video', title: 'Diseño 3D con Tinkercad', url: 'https://notebooklm.google.com/notebook/ce0d46b5-6ece-42fd-bead-11b1868bf5a8?artifactId=96946ba4-72a8-468a-a6e1-98c21b6788bc' },
      { type: 'presentation', title: 'Tinkercad 3D Design Workshop', url: 'https://notebooklm.google.com/notebook/ce0d46b5-6ece-42fd-bead-11b1868bf5a8?artifactId=06913914-ce8f-4ac4-9873-89ea06bb4efb' },
      { type: 'infographic', title: 'Guía de diseño en 3D', url: 'https://notebooklm.google.com/notebook/ce0d46b5-6ece-42fd-bead-11b1868bf5a8?artifactId=02ee7302-3c10-4ed3-b6c8-f998acc30b91' }
    ],
    buttons: [
      { label: 'ENTRAR AL PLANETA', url: 'https://www.tinkercad.com/dashboard', color: 'yellow' },
      { label: 'TUTORIALES', url: 'https://www.tinkercad.com/learn', color: 'purple', icon: 'Play' }
    ]
  },
  { 
    id: 'arduino', 
    name: 'Arduino', 
    image: '/planets/arduino.png', 
    icon: 'Cpu',
    color: '#e6f7ff', 
    barColor: '#0097e6', 
    url: 'https://www.tinkercad.com/circuits', 
    notebook: '7829705a-3870-4966-880c-99c0dae830c2', 
    subtitle: 'Robótica y electrónica textual.',
    description: 'Programación de microcontroladores y circuitos electrónicos.',
    recommendation: 'En este sector usamos C++ textual. Prueba el circuito de Blink Leds.'
  },
  { 
    id: 'appinventor', 
    name: 'App Inventor', 
    image: '/planets/app%20inventor.png', 
    icon: 'Smartphone',
    color: '#e6ffec', 
    barColor: '#00cc55', 
    url: 'https://ai2.appinventor.mit.edu/', 
    notebook: '7829705a-3870-4966-880c-99c0dae830c2', 
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
    notebook: '7829705a-3870-4966-880c-99c0dae830c2', 
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
    notebook: '7829705a-3870-4966-880c-99c0dae830c2', 
    subtitle: 'Scripting planetario y backend.',
    description: 'Lenguaje de programación profesional para ciencia de datos y web.',
    recommendation: 'Domina los tipos de datos básicos antes de saltar a las funciones.'
  },
  { 
    id: 'html', 
    name: 'HTML / CSS / JS', 
    image: '/planets/html.jpg', 
    icon: 'Globe',
    color: '#fff5f2', 
    barColor: '#e44d26', 
    url: 'https://codepen.io/pen/', 
    notebook: '7829705a-3870-4966-880c-99c0dae830c2', 
    subtitle: 'Construcción de Front-end.',
    description: 'Crea la estructura y el estilo de la web moderna.',
    recommendation: 'CSS es la clave para que tu web se vea profesional. ¡No le tengas miedo!'
  },
];

export const getPlanetById = (id) => {
  return PLANETS.find(p => p.id === id?.toLowerCase()) || null;
};

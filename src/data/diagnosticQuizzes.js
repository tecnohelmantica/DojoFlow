export const diagnosticQuizzes = {
  code: [
    {
      pregunta: "¿Qué entorno de Code.org requiere evitar el modo de 'Navegación Privada' para cargar bien?",
      opciones: ["App Lab", "Web Lab", "Game Lab"],
      correcta: 1,
      explicacion: "Web Lab puede presentar problemas en modo incógnito. ¡Es mejor usar el modo normal para guardar tus avances!"
    },
    {
      pregunta: "¿Cuál es una forma sencilla de entrar a Code.org sin usar correo electrónico?",
      opciones: ["Usar número de teléfono", "Usar huella dactilar", "Usar contraseñas de imagen (dibujos secretos)"],
      correcta: 2,
      explicacion: "¡Exacto! El profesor puede darte un dibujo secreto (como un pulpo) para entrar rápido."
    },
    {
      pregunta: "En la IA Generativa, ¿qué proceso ocurre justo antes de la salida (Output)?",
      opciones: ["Entrenamiento", "Atención (Attention)", "Limpiar datos"],
      correcta: 1,
      explicacion: "La 'Atención' ayuda a la IA a decidir qué partes de la información son más importantes antes de responder."
    }
  ],
  scratch: [
    {
      pregunta: "¿Cuál es el tamaño máximo del escenario en Scratch?",
      opciones: ["100x100 píxeles", "480x360 píxeles", "1920x1080 píxeles"],
      correcta: 1,
      explicacion: "El escenario tiene 480 de ancho por 360 de alto. ¡Es tu lienzo para crear!"
    },
    {
      pregunta: "¿Qué tipo de dato pueden guardar las 'Variables en la nube' en Scratch?",
      opciones: ["Solo números", "Solo texto", "Imágenes y sonidos"],
      correcta: 0,
      explicacion: "Las variables en la nube son especiales: solo admiten números. Para guardar texto, hay que usar trucos de código."
    },
    {
      pregunta: "En 'Mis Bloques', ¿para qué sirve la casilla 'Ejecutar al instante'?",
      opciones: ["Para que el juego pese menos", "Para que los clones desaparezcan", "Para calcular movimientos de forma invisible y rápida"],
      correcta: 2,
      explicacion: "¡Muy bien! Permite hacer cálculos complejos sin que se vea el 'parpadeo' en la pantalla."
    }
  ],
  arduino: [
    {
      pregunta: "¿A dónde se conecta la pata larga (ánodo) de un LED?",
      opciones: ["Al polo negativo (GND)", "Al polo positivo (pin digital)", "A ningún sitio"],
      correcta: 1,
      explicacion: "La pata larga es el positivo. Si la conectas al revés, ¡el LED no brillará!"
    },
    {
      pregunta: "¿Para qué sirve el símbolo '~' en los pines de Arduino (PWM)?",
      opciones: ["Para medir la temperatura", "Para graduar la potencia (como el brillo de un LED)", "Para apagar la placa"],
      correcta: 1,
      explicacion: "¡Eso es! El PWM permite simular señales analógicas para controlar la fuerza o el brillo."
    },
    {
      pregunta: "¿Qué componente usamos para controlar la dirección de un motor?",
      opciones: ["Una resistencia", "Un puente H (como el L293D)", "Un condensador"],
      correcta: 1,
      explicacion: "El puente H permite que el motor gire hacia adelante o hacia atrás. ¡Es el motor de tus robots!"
    }
  ],
  python: [
    {
      pregunta: "¿Qué función usamos en Python para saber el tipo de un dato?",
      opciones: ["check()", "type()", "whatitis()"],
      correcta: 1,
      explicacion: "Usamos type() para saber si algo es un número (int), texto (str) o una lista."
    },
    {
      pregunta: "¿Cuál es la diferencia entre una Lista y una Tupla?",
      opciones: ["No hay diferencia", "Las tuplas son más lentas", "Las listas se pueden cambiar (mutables) y las tuplas no (inmutables)"],
      correcta: 2,
      explicacion: "Exacto. Las listas son como mochilas que puedes llenar o vaciar; las tuplas son cajas cerradas."
    },
    {
      pregunta: "¿Qué es una función 'lambda'?",
      opciones: ["Una función secreta", "Una función de una sola línea y sin nombre", "Una función para borrar archivos"],
      correcta: 1,
      explicacion: "Lambda es muy útil para funciones rápidas y cortas que solo hacen una cosa."
    }
  ],
  web: [
    {
      pregunta: "¿Qué atributo usamos en <img> para poner la ruta de la imagen?",
      opciones: ["href", "src", "link"],
      correcta: 1,
      explicacion: "src significa 'source' (fuente). ¡Sin eso, el navegador no sabe qué imagen mostrar!"
    },
    {
      pregunta: "En CSS, ¿cómo se llama el espacio entre el texto y el borde de su caja?",
      opciones: ["Border", "Margin", "Padding"],
      correcta: 2,
      explicacion: "El padding es el relleno interior. ¡Es lo que evita que el texto choque con el borde!"
    },
    {
      pregunta: "¿Qué hace el atributo 'defer' en una etiqueta <script>?",
      opciones: ["Carga el código más tarde para no frenar la página", "Borra el código", "Cambia el color de la página"],
      correcta: 0,
      explicacion: "¡Correcto! Ayuda a que la página cargue más rápido mientras el código se prepara en segundo plano."
    }
  ],
  appinventor: [
    {
      pregunta: "¿Qué componente de App Inventor se usa para 'hablar' o convertir texto a voz?",
      opciones: ["Etiqueta", "Reproductor", "Texto a voz"],
      correcta: 2,
      explicacion: "¡Fácil! El componente 'Texto a voz' hace que tu móvil hable."
    },
    {
      pregunta: "En App Inventor, ¿dónde se programa el comportamiento de los botones?",
      opciones: ["En la Vista Diseñador", "En el Editor de Bloques", "En la Tienda de Apps"],
      correcta: 1,
      explicacion: "La lógica siempre se hace en el Editor de Bloques. El Diseñador es solo para lo visual."
    }
  ],
  learningml: [
    {
      pregunta: "¿Qué es 'entrenar' un modelo en LearningML?",
      opciones: ["Hacer que la IA haga ejercicio", "Darle muchos ejemplos para que aprenda a reconocer patrones", "Instalar el programa"],
      correcta: 1,
      explicacion: "Entrenar es enseñar. Cuantos más ejemplos le des (perros, gatos, etc.), mejor aprenderá."
    }
  ],
  // Mapping for consistency
  html: 'web',
  arcade: 'scratch',
  microbit: 'arduino',
  '3d': 'arduino'
};

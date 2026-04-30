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
  html: [
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
    },
    {
      pregunta: "¿Cuál es la forma más rápida de probar tu app en un móvil real?",
      opciones: ["Subiéndola a la Play Store", "Usando el AI Companion y escaneando el código QR", "Enviándola por correo"],
      correcta: 1,
      explicacion: "¡Exacto! El AI Companion te permite ver los cambios en tiempo real mientras programas."
    }
  ],
  ia: [
    {
      pregunta: "¿Qué es 'entrenar' un modelo de Machine Learning?",
      opciones: ["Hacer que la IA haga ejercicio", "Darle muchos ejemplos para que aprenda a reconocer patrones", "Instalar el programa"],
      correcta: 1,
      explicacion: "Entrenar es enseñar. Cuantos más ejemplos le des (perros, gatos, etc.), mejor aprenderá."
    },
    {
      pregunta: "En Inteligencia Artificial, ¿qué son las 'Etiquetas' (Labels)?",
      opciones: ["Pegatinas para el ordenador", "Categorías para clasificar los datos (ej: 'Perro' o 'Gato')", "Nombres de los alumnos"],
      correcta: 1,
      explicacion: "Las etiquetas ayudan a la IA a saber qué está viendo en cada ejemplo durante su entrenamiento."
    },
    {
      pregunta: "¿Qué sucede si entrenamos a una IA con datos sesgados o incompletos?",
      opciones: ["La IA se vuelve más inteligente", "La IA aprenderá prejuicios y cometerá errores injustos", "No pasa nada"],
      correcta: 1,
      explicacion: "¡Importante! Si solo le enseñas fotos de perros blancos, la IA no sabrá reconocer a un perro negro. ¡La calidad de los datos es clave!"
    }
  ],
  'makecode-microbit': [
    {
      pregunta: "¿Qué sensor del micro:bit detecta si lo estamos agitando o inclinando?",
      opciones: ["Termómetro", "Acelerómetro", "Brújula"],
      correcta: 1,
      explicacion: "El acelerómetro mide el movimiento y la inclinación en tres ejes. ¡Ideal para juegos de agitar!"
    },
    {
      pregunta: "¿Cuántos botones programables tiene el micro:bit en su parte frontal?",
      opciones: ["Solo 1", "2 (A y B)", "5 botones"],
      correcta: 1,
      explicacion: "Tiene dos botones principales, A y B, que puedes usar para activar cualquier acción en tu código."
    },
    {
      pregunta: "¿Cómo se llama el bloque que se ejecuta una sola vez al encender el micro:bit?",
      opciones: ["Para siempre", "Al iniciar", "Si entonces"],
      correcta: 1,
      explicacion: "El bloque 'Al iniciar' es perfecto para configurar variables o mostrar un mensaje de bienvenida."
    }
  ],
  'makecode-arcade': [
    {
      pregunta: "¿Qué es un 'Sprite' en MakeCode Arcade?",
      opciones: ["Una bebida gaseosa", "Un personaje u objeto que puede moverse e interactuar", "Un tipo de fuente de texto"],
      correcta: 1,
      explicacion: "Los sprites son el corazón de tus juegos: jugadores, enemigos, proyectiles o comida."
    },
    {
      pregunta: "¿Cuál es el bloque más rápido para hacer que tu personaje se mueva con el simulador?",
      opciones: ["Mover con botones", "Cambiar X por 10", "Seguir al ratón"],
      correcta: 0,
      explicacion: "El bloque 'mover sprite con botones' configura automáticamente el control básico por ti."
    },
    {
      pregunta: "¿Qué sucede si no usas el bloque 'Establecer color de fondo'?",
      opciones: ["El juego no funciona", "El fondo será negro por defecto", "La pantalla parpadeará"],
      correcta: 1,
      explicacion: "Por defecto la pantalla está vacía (negra). ¡Dale color o pon una imagen para que tu mundo cobre vida!"
    }
  ],
  tinkercad: [
    {
      pregunta: "¿Qué es el 'Plano de trabajo' en Tinkercad?",
      opciones: ["Un papel para dibujar", "La rejilla azul donde colocas y diseñas tus formas", "Una herramienta de corte"],
      correcta: 1,
      explicacion: "Es tu base de operaciones 3D. Todo lo que construyas se apoya sobre este plano."
    },
    {
      pregunta: "¿Cómo se crea un 'Hueco' (Hole) en una pieza sólida?",
      opciones: ["Borrando la pieza", "Cambiando su propiedad a 'Hueco' y agrupándola con un sólido", "Pintándola de blanco"],
      correcta: 1,
      explicacion: "Al agrupar un objeto tipo 'Hueco' con uno sólido, el hueco 'come' la parte del sólido que toca."
    },
    {
      pregunta: "¿Qué función cumple la herramienta 'Agrupar' (Ctrl+G)?",
      opciones: ["Cambiar el color", "Unir varias formas en una sola pieza", "Duplicar el objeto"],
      correcta: 1,
      explicacion: "Agrupar fusiona las formas. Es esencial para crear diseños complejos a partir de piezas simples."
    }
  ]
};

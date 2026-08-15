export const diagnosticQuizzes = {
  // Aliases for matching planet IDs
  arcade: 'makecode-arcade',
  microbit: 'makecode-microbit',

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
    },
    {
      pregunta: "¿Qué bloque de Code.org se usa para repetir una acción un número específico de veces?",
      opciones: ["Si", "Repetir", "Mientras"],
      correcta: 1,
      explicacion: "El bloque 'Repetir' (bucle for) es ideal cuando sabes exactamente cuántas veces quieres que algo ocurra."
    },
    {
      pregunta: "¿Qué es un 'Algoritmo' en programación?",
      opciones: ["Un robot inteligente", "Una lista de pasos para resolver un problema", "Un tipo de monitor"],
      correcta: 1,
      explicacion: "Un algoritmo es como una receta de cocina: pasos ordenados para llegar a un resultado."
    },
    {
      pregunta: "¿Para qué sirve el botón 'Paso a paso' en Code.org?",
      opciones: ["Para ir más rápido", "Para ver cómo se ejecuta cada bloque uno por uno", "Para borrar el código"],
      correcta: 1,
      explicacion: "Es genial para encontrar errores (debugging), ya que ves exactamente qué hace cada bloque."
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
    },
    {
      pregunta: "¿Cuál es el límite máximo de clones activos en un proyecto de Scratch?",
      opciones: ["No hay límite", "300 clones", "1000 clones"],
      correcta: 1,
      explicacion: "Scratch limita a 300 los clones para que el navegador no se bloquee. ¡Gestiona bien tus recursos!"
    },
    {
      pregunta: "¿Para qué sirve el bloque '¿Tocando color?'?",
      opciones: ["Para pintar el fondo", "Para detectar colisiones con elementos de un color específico", "Para cambiar el disfraz"],
      correcta: 1,
      explicacion: "Es muy útil para juegos de plataformas, como detectar si tocas lava (rojo) o hierba (verde)."
    },
    {
      pregunta: "¿Qué sucede si usas un bucle 'Por siempre' sin ningún bloque de movimiento dentro?",
      opciones: ["El programa se detiene", "El objeto no se moverá pero el bucle seguirá funcionando", "Scratch se cierra"],
      correcta: 1,
      explicacion: "El bucle sigue 'trabajando' en segundo plano, aunque no veas cambios visuales inmediatos."
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
    },
    {
      pregunta: "¿Cuál es el voltaje estándar de salida de la mayoría de pines digitales de un Arduino Uno?",
      opciones: ["1.5V", "5V", "12V"],
      correcta: 1,
      explicacion: "La mayoría de placas Arduino trabajan a 5V, aunque algunas modernas usan 3.3V."
    },
    {
      pregunta: "¿Qué función se ejecuta solo una vez al encender el Arduino?",
      opciones: ["loop()", "setup()", "start()"],
      correcta: 1,
      explicacion: "setup() es para configurar los pines. loop() se repite infinitamente después."
    },
    {
      pregunta: "¿Para qué sirve una resistencia en serie con un LED?",
      opciones: ["Para que brille más", "Para limitar la corriente y que el LED no se queme", "Para cambiar el color"],
      correcta: 1,
      explicacion: "Los LEDs son muy sensibles. Sin resistencia, ¡podrían absorber demasiada energía y fundirse!"
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
    },
    {
      pregunta: "¿Cómo se llama el operador para saber el resto de una división?",
      opciones: ["/", "//", "%"],
      correcta: 2,
      explicacion: "El operador módulo (%) te da lo que sobra. ¡Útil para saber si un número es par o impar!"
    },
    {
      pregunta: "¿Qué significa la 'sangría' (indentación) en Python?",
      opciones: ["Es solo para que quede bonito", "Define qué bloques de código pertenecen a un bucle o función", "Es un error"],
      correcta: 1,
      explicacion: "En Python, el espacio al inicio de la línea es obligatorio. ¡Le dice al programa dónde empieza y acaba un bloque!"
    },
    {
      pregunta: "¿Qué hace el comando 'import'?",
      opciones: ["Borra una variable", "Trae herramientas y funciones de otras librerías", "Cierra el programa"],
      correcta: 1,
      explicacion: "Permite usar el trabajo de otros, como 'random' para azar o 'math' para mates complejas."
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
    },
    {
      pregunta: "¿Qué es una 'Red Neuronal'?",
      opciones: ["Un cerebro artificial", "Un sistema matemático inspirado en las neuronas humanas", "Un cable de internet"],
      correcta: 1,
      explicacion: "Son capas de cálculos que aprenden a reconocer patrones muy complejos, como caras o voces."
    },
    {
      pregunta: "¿Cuál es la principal diferencia entre IA y un programa tradicional?",
      opciones: ["La IA usa más electricidad", "La IA aprende de los datos en lugar de seguir reglas fijas escritas a mano", "La IA es un robot físico"],
      correcta: 1,
      explicacion: "En la programación normal das las reglas. En la IA, das los ejemplos y ella deduce las reglas."
    },
    {
      pregunta: "¿Qué es el 'Aprendizaje Supervisado'?",
      opciones: ["Un profesor mirando a la IA", "Entrenar con datos que ya tienen la respuesta correcta (etiquetas)", "Hackear un servidor"],
      correcta: 1,
      explicacion: "Es como estudiar con un libro de soluciones: la IA intenta adivinar y luego comprueba si acertó."
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
    },
    {
      pregunta: "¿Cómo se llama la herramienta para alinear perfectamente dos objetos?",
      opciones: ["Regla", "Alinear (L)", "Espejo"],
      correcta: 1,
      explicacion: "La herramienta 'Alinear' permite centrar o ajustar piezas con precisión profesional."
    },
    {
      pregunta: "¿Qué sucede al pulsar la tecla 'D' con un objeto seleccionado?",
      opciones: ["Se borra", "Se duplica", "Cae (Drop) al plano de trabajo"],
      correcta: 2,
      explicacion: "La 'D' es un atajo genial para 'aterrizar' piezas que han quedado flotando en el aire."
    },
    {
      pregunta: "¿Para qué sirve el comando 'Duplicar y repetir' (Ctrl+D)?",
      opciones: ["Solo para copiar", "Para crear patrones repetidos (como escaleras) automáticamente", "Para cambiar el tamaño"],
      correcta: 1,
      explicacion: "Es mágico: si mueves el primer duplicado, los siguientes repetirán ese mismo movimiento."
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
    },
    {
      pregunta: "¿Qué componente del micro:bit sirve para mostrar dibujos o mensajes?",
      opciones: ["Un altavoz", "La matriz de 25 LEDs rojos", "La antena Bluetooth"],
      correcta: 1,
      explicacion: "La cuadrícula de 5x5 LEDs es tu pantalla para iconos, números y texto deslizante."
    },
    {
      pregunta: "¿Cómo se conectan componentes externos (como sensores extra) al micro:bit?",
      opciones: ["Por USB", "Usando los pines de cobre de la parte inferior", "Por Wi-Fi"],
      correcta: 1,
      explicacion: "Los pines 0, 1, 2, 3V y GND permiten usar pinzas de cocodrilo para conectar casi cualquier cosa."
    },
    {
      pregunta: "¿Qué hace el bloque 'Radio' en MakeCode?",
      opciones: ["Pone música", "Permite enviar y recibir mensajes entre varios micro:bits cercanos", "Apaga la placa"],
      correcta: 1,
      explicacion: "¡Es como un walkie-talkie para micro:bits! Ideal para juegos multijugador."
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
    },
    {
      pregunta: "¿Qué es un 'Tilemap' en Arcade?",
      opciones: ["Un mapa de tesoros", "Un editor para crear los niveles y suelos de tu juego", "Una lista de jugadores"],
      correcta: 1,
      explicacion: "Con el tilemap dibujas paredes, suelos y decorados por donde camina tu sprite."
    },
    {
      pregunta: "¿Para qué sirve el bloque 'Al chocar con otro sprite'?",
      opciones: ["Para explotar siempre", "Para programar qué pasa cuando dos objetos se tocan (ej: ganar puntos)", "Para borrar el juego"],
      correcta: 1,
      explicacion: "¡Es vital! Así sabes cuando el jugador toca una moneda, un enemigo o la meta."
    },
    {
      pregunta: "¿Qué significa 'Destruir sprite con efecto'?",
      opciones: ["Que el ordenador se rompe", "Eliminar el personaje con una animación (humo, burbujas...)", "Cambiarle el color"],
      correcta: 1,
      explicacion: "Ayuda a que el juego se vea profesional. ¡Nada mejor que una explosión de confeti al ganar!"
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
    },
    {
      pregunta: "¿Qué significa HTML?",
      opciones: ["How To Make Links", "HyperText Markup Language", "High Technical Modern Logic"],
      correcta: 1,
      explicacion: "Es el lenguaje de marcas que estructura todas las páginas web del mundo."
    },
    {
      pregunta: "¿Cuál es la etiqueta correcta para crear un enlace?",
      opciones: ["<link>", "<a>", "<url>"],
      correcta: 1,
      explicacion: "La 'a' viene de 'anchor' (ancla). ¡Es lo que une una página con otra!"
    },
    {
      pregunta: "En CSS, ¿para qué sirve 'flexbox'?",
      opciones: ["Para que las imágenes pesen menos", "Para organizar y alinear elementos de forma fácil y flexible", "Para hackear"],
      correcta: 1,
      explicacion: "Flexbox es una herramienta poderosa para crear diseños que se adaptan a cualquier pantalla."
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
    },
    {
      pregunta: "¿Qué es una 'Variable' en App Inventor?",
      opciones: ["Un botón que cambia de color", "Un contenedor para guardar datos (nombres, puntos, etc.)", "El nombre de la app"],
      correcta: 1,
      explicacion: "Es como una caja con nombre donde guardas información que puede cambiar durante el juego."
    },
    {
      pregunta: "¿Para qué sirve el componente 'TinyDB'?",
      opciones: ["Para que la app ocupe poco espacio", "Para guardar datos de forma permanente en el móvil", "Para enviar mensajes"],
      correcta: 1,
      explicacion: "Sin TinyDB, al cerrar la app perderías tus puntos. ¡Es la memoria a largo plazo de tu móvil!"
    },
    {
      pregunta: "¿Qué hace el componente 'Lienzo' (Canvas)?",
      opciones: ["Sirve para escribir textos largos", "Permite dibujar, animar sprites y crear juegos táctiles", "Muestra un mapa"],
      correcta: 1,
      explicacion: "¡Es donde ocurre la magia de los juegos! Permite detectar toques y mover personajes por la pantalla."
    }
  ],
  sql: [
    {
      pregunta: "¿Qué es una clave primaria (Primary Key) en una base de datos?",
      opciones: ["Un campo que identifica de forma única cada registro", "Una contraseña para entrar", "Un tipo de dato de texto"],
      correcta: 0,
      explicacion: "La clave primaria funciona como el DNI de cada fila de la tabla, identificándola de manera única y sin poder estar vacía."
    },
    {
      pregunta: "¿Qué comando SQL se utiliza para buscar y extraer información de una tabla?",
      opciones: ["GET", "EXTRACT", "SELECT"],
      correcta: 2,
      explicacion: "La sentencia SELECT es la instrucción estándar y más utilizada en SQL para realizar consultas de datos."
    },
    {
      pregunta: "¿Para qué sirve la cláusula WHERE en una consulta SQL?",
      opciones: ["Para ordenar los resultados de mayor a menor", "Para filtrar las filas que cumplen una condición específica", "Para eliminar la tabla completa"],
      correcta: 1,
      explicacion: "WHERE actúa como un filtro inteligente que solo deja pasar al resultado final aquellas filas que cumplen con la condición que le indiques."
    },
    {
      pregunta: "¿Qué comando DDL se usa para vaciar todos los registros de una tabla rápidamente conservando su estructura intacta?",
      opciones: ["DROP", "DELETE", "TRUNCATE"],
      correcta: 2,
      explicacion: "TRUNCATE realiza un 'reseteo de fábrica' masivo y muy rápido, vaciando el contenido pero dejando el cascarón de la tabla listo para usarse."
    },
    {
      pregunta: "¿Cuál de estos NO es un tipo de relación válida en el diseño de bases de datos?",
      opciones: ["Uno a Uno", "Varios a Infinito", "Varios a Varios"],
      correcta: 1,
      explicacion: "Las relaciones lógicas en bases de datos son Uno a Uno (1:1), Uno a Varios (1:N) y Varios a Varios (N:M)."
    },
    {
      pregunta: "¿Para qué sirve el operador LIKE junto con el comodín '%' en SQL?",
      opciones: ["Para calcular porcentajes matemáticos", "Para realizar búsquedas aproximadas de texto", "Para dar me gusta a una fila"],
      correcta: 1,
      explicacion: "El operador LIKE con el comodín '%' permite buscar cadenas de texto, como por ejemplo encontrar todos los nombres que empiecen por la letra A (LIKE 'A%')."
    }
  ]
};

# 🥋 DojoFlow: El Futuro del Aprendizaje Tech con IA 🚀

¡Bienvenido a **DojoFlow**! Una plataforma educativa revolucionaria diseñada para transformar el aprendizaje de la programación y la robótica en una aventura intergaláctica. 

DojoFlow no es solo un gestor de clases; es un ecosistema donde la gamificación se une con la inteligencia artificial para guiar a los alumnos (Ninjas) a través de retos prácticos en diferentes tecnologías.

---

## 🌌 El Universo DojoFlow

El aprendizaje en DojoFlow se divide en **Planetas Tecnológicos**, cada uno con su propio itinerario de retos:

*   **🪐 Planeta Scratch**: Domina la lógica de bloques.
*   **🪐 Planeta Arkae (MakeCode)**: Crea juegos retro.
*   **🪐 Planeta Pro (Arduino)**: Programación textual C++ para hardware real.
*   **🪐 Planeta 3D (Tinkercad)**: Diseño y modelado tridimensional.
*   **🪐 Planeta App (App Inventor)**: Desarrollo de aplicaciones móviles.

---

## 🧠 Núcleo de Inteligencia (NotebookLM)

DojoFlow integra **NotebookLM** de Google para proporcionar un soporte de aprendizaje sin precedentes:
- **Modo Socrático**: La IA no da la respuesta, guía al alumno con pistas inteligentes.
- **Dojo Studio**: Herramientas para docentes que generan automáticamente mapas mentales, podcasts y resúmenes a partir de los cuadernos de clase.
- **Validación Ninja**: Los alumnos deben explicar técnicamente sus soluciones para que la IA valide su ascenso de nivel.

---

## 🛠️ Características Principales

### 👨‍🏫 Para Docentes (Dojo Studio)
*   **Centro de Aulas**: Gestión completa de clases y alumnos.
*   **Generación Masiva**: Crea cuentas para toda una clase en segundos con un solo clic. 🎟️
*   **Asignación de Recursos**: Distribuye materiales de NotebookLM de forma personalizada.
*   **Validación de Retos**: Supervisa el progreso real de cada estudiante.

### 🥷 Para Alumnos (Dojo Dashboard)
*   **Itinerarios Flexibles**: Los ninjas eligen su propio camino de aprendizaje.
*   **Retos Ninja**: Desafíos prácticos con feedback inmediato.
*   **Sistema de Logros**: Gana medallas y progresa a través de los planetas.

---

## 🚀 Tecnologías Utilizadas

*   **Frontend**: Next.js 14, React, CSS Premium (Glassmorphism & Animaciones).
*   **Backend & DB**: Supabase (PostgreSQL, Auth, RLS).
*   **IA**: Integración con NotebookLM vía MCP.
*   **Estilo**: Diseño moderno, oscuro y vibrante orientado a UX/UI profesional.

---

## 💻 Instalación y Uso Local

1.  **Clona el repositorio**:
    ```bash
    git clone https://github.com/tu-usuario/dojoflow.git
    ```
2.  **Instala las dependencias**:
    ```bash
    npm install
    ```
3.  **Configura las variables de entorno**:
    Crea un archivo `.env.local` con tus credenciales de Supabase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
    SUPABASE_SERVICE_ROLE_KEY=tu_clave_servicio (Mantener secreta)
    ```
4.  **Lanza el servidor de desarrollo**:
    ```bash
    npm run dev
    ```

---

## 📜 Reglas del Dojo (Arquitectura)
*   **Separación de Responsabilidades**: UI, Lógica y Datos están claramente diferenciados.
*   **Socrático por Diseño**: La plataforma fomenta la autonomía del alumno.
*   **Escalabilidad**: Preparado para añadir nuevos planetas y tecnologías fácilmente.

---

Desarrollado con ❤️ para **Advanced Agentic Coding**.

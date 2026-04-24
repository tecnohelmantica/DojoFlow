


async function testSensei() {
  console.log("🚀 Iniciando Demo del Sensei (IA Directa)...");
  
  const payload = {
    mode: "tutor",
    message: "¿Cómo puedo cambiar de pantalla en mi App de Code.org?",
    history: [],
    planet: "code"
  };

  try {
    const response = await fetch('http://localhost:3001/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log("\n✅ [RESPUESTA DEL SENSEI]:");
      console.log("-----------------------------------------");
      console.log(data.text);
      console.log("-----------------------------------------");
      console.log("\n✨ Demo finalizada con éxito. El motor Gemini + Conocimiento Local está operativo.");
    } else {
      console.error("\n❌ Error en el Sensei:", data.error);
      if (data.details) console.error("Detalles:", data.details);
    }
  } catch (error) {
    console.error("\n❌ Error de conexión:", error.message);
    console.log("Asegúrate de que el servidor esté corriendo en http://localhost:3001");
  }
}

testSensei();

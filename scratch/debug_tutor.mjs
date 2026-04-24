// Usando fetch nativo de Node 18+

async function testTutor() {
  console.log("🚀 Probando API del Sensei...");
  try {
    const res = await fetch('http://localhost:3001/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Hola Sensei",
        planet: "code",
        mode: "tutor",
        history: []
      })
    });
    
    const data = await res.json();
    console.log("📡 Respuesta del Sensei:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Error en la petición:", error.message);
  }
}

testTutor();

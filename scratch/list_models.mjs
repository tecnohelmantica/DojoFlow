import { GoogleGenerativeAI } from '@google/generative-ai';
const GEMINI_KEY = "AIzaSyAFa-8Y7zaRNtbkRoi2WGhX3uD346lESRg";

async function listModels() {
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Solo para inicializar
    // Usamos el cliente directo para listar
    console.log("🔍 Listando modelos disponibles para tu API Key...");
    // Nota: La librería a veces no expone listModels directamente fácil, 
    // pero podemos probar con los nombres más comunes.
    const models = ["gemini-pro", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro", "gemini-1.5-flash-8b", "gemini-2.0-flash-exp"];
    
    for (const m of models) {
      try {
        const testModel = genAI.getGenerativeModel({ model: m });
        await testModel.generateContent("test");
        console.log(`✅ Modelo disponible: ${m}`);
      } catch (e) {
        console.log(`❌ Modelo NO disponible: ${m} (${e.message})`);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

listModels();

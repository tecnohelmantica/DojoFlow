
import { GoogleGenerativeAI } from '@google/generative-ai';
const GEMINI_KEY = "AIzaSyAFa-8Y7zaRNtbkRoi2WGhX3uD346lESRg";

async function checkModels() {
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  try {
    // Intentar listar modelos usando la API directamente si es posible, 
    // o probar con un modelo que sabemos que existe en v1beta
    console.log("🔍 Consultando modelos oficiales...");
    
    // El SDK tiene un cliente que permite listar
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("✅ Modelos encontrados:");
      data.models.forEach(m => {
        console.log(`- ${m.name} (Soporta: ${m.supportedGenerationMethods.join(', ')})`);
      });
    } else {
      console.log("❌ No se devolvieron modelos. Respuesta:", JSON.stringify(data));
    }
  } catch (error) {
    console.error("❌ Error de red:", error.message);
  }
}

checkModels();

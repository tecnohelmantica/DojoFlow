import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("AIzaSyAFa-8Y7zaRNtbkRoi2WGhX3uD346lESRg");

async function testQuota() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hola, responde solo 'OK' si recibes esto.");
    const response = await result.response;
    console.log("Resultado:", response.text());
  } catch (error) {
    console.error("Error detectado:", error.message);
    if (error.message.includes("429") || error.message.includes("Quota")) {
      console.log("DIAGNÓSTICO: La API Key ha agotado su cuota gratuita diaria.");
    }
  }
}

testQuota();

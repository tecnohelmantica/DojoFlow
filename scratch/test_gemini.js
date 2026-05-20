import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testGeminiChat() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  console.log('--- Testing startChat with gemini-flash-latest ---');
  try {
    const history = [
      { role: 'user', parts: [{ text: 'Hola Sensei' }] },
      { role: 'model', parts: [{ text: 'Hola, joven aprendiz. ¿En qué te puedo ayudar hoy?' }] }
    ];
    const chat = model.startChat({ history });
    const result = await chat.sendMessage("¿Qué es un bucle?");
    console.log('✅ Chat Success:', result.response.text().trim());
  } catch (error) {
    console.error('❌ Chat Failed:', error);
  }

  console.log('\n--- Testing startChat with history starting with model role ---');
  try {
    // This is what the code gets initially if not shifted properly, or what happens when shifted
    const history = [
      { role: 'model', parts: [{ text: 'Hola! He recibido tu entrega...' }] }
    ];
    // In our route.js, it shifts this out, leaving it empty. Let's see if startChat works with empty history.
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage("he utilizado el bloque al iniciar");
    console.log('✅ Empty History Chat Success:', result.response.text().trim());
  } catch (error) {
    console.error('❌ Empty History Chat Failed:', error);
  }
}

testGeminiChat();

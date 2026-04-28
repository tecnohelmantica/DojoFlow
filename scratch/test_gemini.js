import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Using API Key:', apiKey ? 'Present' : 'Missing');
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent("Hola");
    console.log('Response:', result.response.text());
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();

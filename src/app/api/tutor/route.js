import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs';
import { PLANETS } from '../../../lib/planets';

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { mode, message, history, planet } = await req.json();
    
    // 1. Resolver el Planeta y cargar Conocimiento Local
    const searchPlanet = (planet || 'code').toLowerCase().trim();
    const planetData = PLANETS.find(p => 
      p.id.toLowerCase() === searchPlanet || 
      p.name.toLowerCase() === searchPlanet
    );
    
    const planetId = planetData?.id || 'code';
    const planetName = planetData?.name || 'Dojo General';
    
    // Cargar JSON de conocimiento si existe
    let localKnowledge = "";
    try {
      const knowledgePath = path.resolve(process.cwd(), 'src/data', `${planetId}_knowledge.json`);
      if (fs.existsSync(knowledgePath)) {
        const rawData = fs.readFileSync(knowledgePath, 'utf8');
        localKnowledge = `CONOCIMIENTO ESPECÍFICO DEL PLANETA ${planetName.toUpperCase()}:\n${rawData}`;
      }
    } catch (e) {
      console.warn("No se pudo cargar conocimiento local:", e.message);
    }

    // 2. Configurar el Rol del Sensei
    const systemPrompt = mode === 'generator' 
      ? `Eres un generador de retos educativos para DojoFlow. PLANETA: ${planetName}. Responde EXCLUSIVAMENTE con un bloque JSON de 4 retos.`
      : `Eres el Sensei de DojoFlow, un tutor experto en programación. 
         PLANETA ACTUAL: ${planetName}.
         MODO: ${mode === 'validador' ? 'VALIDADOR EXIGENTE' : 'TUTOR SOCRÁTICO'}.
         REGLAS: 
         - Nunca des el código.
         - Usa pistas y analogías.
         - Si eres validador y el alumno demuestra lógica, termina con "[VALIDADO]".
         - Conocimiento extra: ${localKnowledge}`;

    // 3. Configurar Modelo con Seguridad Relajada para Educación
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ]
    });

    // 4. Iniciar Chat con Historial (si existe)
    const chatHistory = history ? history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    })) : [];

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message || "¡Hola!");
    const response = await result.response;
    const responseText = response.text();

    return NextResponse.json({ 
      success: true, 
      text: responseText 
    });

  } catch (error) {
    console.error('[Sensei Error]:', error);
    
    // Detectar errores específicos de cuota o seguridad
    let errorMsg = "El Sensei está meditando profundamente.";
    if (error.message?.includes('429')) errorMsg = "El Dojo está muy concurrido. Espera un minuto.";
    if (error.message?.includes('SAFETY')) errorMsg = "Mis sensores han detectado algo inusual. Cambiemos de tema.";

    return NextResponse.json({ 
      success: false, 
      error: errorMsg,
      details: error.message
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs';
import { PLANETS } from '../../../lib/planets';

// Inicializar Gemini (Fallback)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function POST(req) {
  try {
    const body = await req.json();
    const { mode, message, history, planet, sessionId } = body;
    
    // 1. Resolver el Planeta
    const searchPlanet = (planet || 'code').toLowerCase().trim();
    const planetData = PLANETS.find(p => 
      p.id.toLowerCase() === searchPlanet || 
      p.name.toLowerCase() === searchPlanet
    );
    
    const planetId = planetData?.id || 'code';
    const planetName = planetData?.name || 'Dojo General';

    // ============================================================================
    // 🧠 NUEVA ARQUITECTURA PRODUCCIÓN: ORQUESTACIÓN CON n8n + RAG (Supabase)
    // ============================================================================
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (n8nWebhookUrl) {
      console.log(`[Sensei RAG] Derivando consulta a n8n Webhook: ${n8nWebhookUrl}`);
      
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${process.env.N8N_AUTH_TOKEN || ''}` // Descomentar si aseguras el webhook
        },
        body: JSON.stringify({
          sessionId: sessionId || 'default_dojoflow_session',
          message: message || "¡Hola!",
          mode: mode || 'tutor',
          planet: planetId,
          planetName: planetName,
          // Historial enviado por si n8n no gestiona su propia memoria en base de datos
          history: history || []
        })
      });

      if (!n8nResponse.ok) {
        throw new Error(`n8n respondió con error de servidor (Estado: ${n8nResponse.status})`);
      }

      const n8nData = await n8nResponse.json();
      
      // n8n debe devolver un JSON en su nodo final ("Respond to Webhook").
      // Por defecto, si usas un AI Agent, la respuesta suele ir en la propiedad "output" o "text".
      const replyText = n8nData.output || n8nData.text || n8nData.message || (typeof n8nData === 'string' ? n8nData : "El oráculo de n8n ha respondido pero el formato es irreconocible.");

      return NextResponse.json({ 
        success: true, 
        text: replyText 
      });
    }

    // ============================================================================
    // ⚠️ ARQUITECTURA DE DESARROLLO: FALLBACK LOCAL A GEMINI (Sin RAG Dinámico)
    // ============================================================================
    if (!genAI) {
      return NextResponse.json({ success: false, error: "Servidor sin motor de IA configurado." }, { status: 500 });
    }

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

    const chatHistory = history ? history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    })) : [];

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message || "¡Hola!");
    const response = await result.response;
    
    return NextResponse.json({ 
      success: true, 
      text: response.text() 
    });

  } catch (error) {
    console.error('[Sensei Error]:', error);
    
    let errorMsg = "El Sensei está meditando profundamente.";
    if (error.message?.includes('429')) errorMsg = "El Dojo está muy concurrido. Espera un minuto.";
    if (error.message?.includes('SAFETY')) errorMsg = "Mis sensores han detectado algo inusual. Cambiemos de tema.";
    if (error.message?.includes('n8n')) errorMsg = "Error conectando con el orquestador n8n. Verifica la URL de producción.";

    return NextResponse.json({ 
      success: false, 
      error: errorMsg,
      details: error.message
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../../../lib/supabaseClient';
import { PLANETS } from '../../../lib/planets';
import { fetchResource } from '../notebooklm/fetcher';

// Mapeo de planetas a variables de entorno de NotebookLM
const NOTEBOOK_MAP = {
  'scratch': process.env.NB_SCRATCH,
  'arduino': process.env.NB_ARDUINO,
  'tinkercad': process.env.NB_TINKERCAD,
  'microbit': process.env.NB_MAKECODE_MICROBIT,
  'arcade': process.env.NB_MAKECODE_ARCADE,
  'code': process.env.NB_CODE,
  'learningml': process.env.NB_LEARNINGML,
  'python': process.env.NB_PYTHON,
  'html': process.env.NB_HTML,
  'appinventor': process.env.NB_APPINVENTOR
};

export async function POST(req) {
  const startTime = Date.now();
  try {
    const { userId, mode, message, history, planet, level, missionType, missionTheme } = await req.json();
    const studentLevel = level || 'Junior';
    const searchPlanet = (planet || "scratch").toLowerCase();
    
    const planetData = PLANETS.find(p => 
      p.id.toLowerCase() === searchPlanet || 
      p.name.toLowerCase() === searchPlanet
    );
    
    const planetId = planetData?.id || 'scratch';
    const planetName = planetData?.name || 'Dojo Flow';

    console.log(`[Tutor API] Request for ${planetId} (${mode}) - Level: ${studentLevel} - Type: ${missionType} - Theme: ${missionTheme}`);

    // --- PRIORIDAD 1: NOTEBOOKLM (Si estamos en local y hay ID configurado) ---
    const isLocal = process.env.NODE_ENV === 'development' || process.env.HOSTNAME === 'localhost';
    const notebookId = NOTEBOOK_MAP[planetId];

    if (isLocal && notebookId) {
      try {
        console.log(`[Tutor API] Intentando conectar con NotebookLM para ${planetId}...`);
        const notebookUrl = `https://notebooklm.google.com/notebook/${notebookId}`;
        
        let promptTemplate = "";
        
        if (mode === 'mission_generator') {
          promptTemplate = `Actúa como el Sensei Socrático de DojoFlow. Genera una Misión Especial para un alumno:
- Nivel: ${studentLevel}
- Planeta: ${planetName}
- Tipo de Reto: ${missionType || 'Aleatorio'}
- Tema: ${missionTheme || 'Cualquiera'}

La respuesta DEBE ser exclusivamente un objeto JSON válido con estos campos:
{
  "title": "Título épico",
  "description": "Narrativa espacial/dojo",
  "objective": "Reto práctico concreto",
  "learning_objectives": ["obj1", "obj2"],
  "sensei_tips": "Breve consejo socrático (sin solución)",
  "estimated_time": "Tiempo estimado (ej: 20 min)",
  "reward_xp": 50,
  "recommended_resources": ["recurso1", "recurso2"]
}
Usa exclusivamente el conocimiento de este cuaderno. No entregues código.`;
        } else {
          // Construimos un prompt enriquecido para el Sensei en NotebookLM
          promptTemplate = `Contexto: El alumno está en el planeta ${planetName}. 
Nivel del alumno: ${studentLevel}.
Modo: ${mode === 'validador' ? 'Validación de reto' : 'Consulta general'}.
Historial reciente: ${JSON.stringify(history?.slice(-3))}
Pregunta: ${message}

Responde como el Sensei de DojoFlow. Sé socrático y usa analogías.
REGLA DE VALIDACIÓN:
- Si el nivel es 'Junior', NO pidas explicaciones técnicas profundas. Haz una única pregunta sencilla sobre qué hace su código o por qué eligió un bloque.
- NUNCA hagas más de una pregunta a la vez.
- Si la explicación es razonable para su nivel, incluye el comando [VALIDADO] al final.
- No des el código directamente.`;
        }

        const responseText = await fetchResource(notebookUrl, promptTemplate);
        
        if (responseText && responseText !== 'Error') {
          console.log(`[Tutor API] Respuesta obtenida de NotebookLM en ${Date.now() - startTime}ms`);
          await saveToHistory(userId, planetId, planetName, message, responseText, history);
          return NextResponse.json({ success: true, text: responseText, source: 'notebooklm' });
        }
      } catch (nbError) {
        console.warn(`[Tutor API] NotebookLM falló, reintentando con Gemini:`, nbError.message);
      }
    }

    // --- PRIORIDAD 2: GEMINI (Fallback o Producción) ---
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY no configurada');

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const systemPrompt = `Eres el Sensei de DojoFlow, un tutor experto en programación inspirado en la pedagogía de @tecnohelmantica.
         PLANETA ACTUAL: ${planetName}.
         NIVEL DEL ALUMNO: ${studentLevel}.
         MODO: ${mode === 'validador' ? 'MENTOR DE VALIDACIÓN' : 'TUTOR SOCRÁTICO'}.
         REGLAS CRÍTICAS: 
         1. Nunca des el código directo. 
         2. Usa pistas graduadas y analogías. 
         3. Si el alumno es '${studentLevel}' y es Junior, haz preguntas muy simples.
         4. NO hagas cuestionarios de varias preguntas. Haz una sola pregunta clara.
         5. Si el alumno demuestra entender lo básico de su reto, incluye [VALIDADO] en tu respuesta.
         6. Si es Arduino (Pro), usa C++ textual.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest", 
      systemInstruction: mode === 'mission_generator' ? 
        `Eres el Sensei de DojoFlow. Genera una Misión Especial en JSON para nivel ${studentLevel}, planeta ${planetName}, tipo ${missionType || 'aleatorio'} y tema ${missionTheme || 'libre'}.
         Campos obligatorios: title, description, objective, learning_objectives (array), sensei_tips, estimated_time, reward_xp, recommended_resources (array).
         No des código. Sé socrático y creativo. El reto debe ser práctico.` :
        `Eres el Sensei de DojoFlow, un tutor experto en programación inspirado en la pedagogía de @tecnohelmantica.
         PLANETA ACTUAL: ${planetName}.
         NIVEL DEL ALUMNO: ${studentLevel}.
         MODO: ${mode === 'validador' ? 'MENTOR DE VALIDACIÓN' : 'TUTOR SOCRÁTICO'}.
         REGLAS CRÍTICAS: 
         1. Nunca des el código directo. 
         2. Usa pistas graduadas y analogías. 
         3. Si el alumno es '${studentLevel}' y es Junior, haz preguntas muy simples.
         4. NO hagas cuestionarios de varias preguntas. Haz una sola pregunta clara.
         5. Si el alumno demuestra entender lo básico de su reto, incluye [VALIDADO] en tu respuesta.
         6. Si es Arduino (Pro), usa C++ textual.`
    });

    const cleanMessage = (message || "").trim() || (mode === 'mission_generator' ? "Genera una nueva misión épica" : "");
    if (!cleanMessage) return NextResponse.json({ success: false, error: 'Mensaje vacío' }, { status: 400 });

    console.log(`[Tutor API] Consultando Gemini 1.5 Flash...`);
    
    let responseText = "";
    if (history && history.length > 0) {
        let sanitizedHistory = history.filter(h => h.role !== 'system').map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content || h.text || "" }]
        })).slice(-10);

        // La API de Gemini requiere que el historial comience con el rol 'user'
        while (sanitizedHistory.length > 0 && sanitizedHistory[0].role !== 'user') {
            sanitizedHistory.shift();
        }

        const chat = model.startChat({ history: sanitizedHistory });
        const result = await chat.sendMessage(cleanMessage);
        responseText = result.response.text();
    } else {
        const result = await model.generateContent(cleanMessage);
        responseText = result.response.text();
    }

    await saveToHistory(userId, planetId, planetName, cleanMessage, responseText, history);
    return NextResponse.json({ success: true, text: responseText, source: 'gemini' });

  } catch (error) {
    console.error('[Tutor API Error]:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Sensei en meditación', 
      details: error.message 
    }, { status: 500 });
  }
}

async function saveToHistory(userId, planetId, planetName, message, responseText, history) {
  if (!userId) return;
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase.from('recursos_docentes')
      .select('id').eq('profesor_id', userId).eq('tipo_recurso', 'conversacion_tutor')
      .eq('tecnologia', planetId).gte('fecha_creacion', today).maybeSingle();

    const fullHistory = [...(history || []), { role: 'user', content: message }, { role: 'tutor', content: responseText }];

    if (existing) {
      await supabase.from('recursos_docentes').update({ 
        contenido: { history: fullHistory, last_update: new Date().toISOString() } 
      }).eq('id', existing.id);
    } else {
      await supabase.from('recursos_docentes').insert({
        profesor_id: userId, tecnologia: planetId, tipo_recurso: 'conversacion_tutor',
        nombre_recurso: `Chat Sensei - ${planetName}`,
        contenido: { history: fullHistory, created_at: new Date().toISOString() }
      });
    }
  } catch (e) { 
    console.warn('DB Persist Error:', e.message); 
  }
}


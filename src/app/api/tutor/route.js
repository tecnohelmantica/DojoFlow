import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = "force-dynamic";
import { supabase } from '../../../lib/supabaseClient';
import { PLANETS } from '../../../lib/planets';
import { fetchResource } from '../notebooklm/fetcher';

// Importación estática de conocimientos locales para evitar errores de bundle dinámicos en Serverless/Vercel
import scratchKnowledge from '../../../data/scratch_knowledge.json';
import arduinoKnowledge from '../../../data/arduino_knowledge.json';
import tinkercadKnowledge from '../../../data/tinkercad_knowledge.json';
import microbitKnowledge from '../../../data/makecode-microbit_knowledge.json';
import arcadeKnowledge from '../../../data/makecode-arcade_knowledge.json';
import codeKnowledge from '../../../data/code_knowledge.json';
import iaKnowledge from '../../../data/ia_knowledge.json';
import pythonKnowledge from '../../../data/python_knowledge.json';
import htmlKnowledge from '../../../data/html_knowledge.json';
import appinventorKnowledge from '../../../data/appinventor_knowledge.json';

const STATIC_KNOWLEDGE = {
  'scratch': scratchKnowledge,
  'arduino': arduinoKnowledge,
  'tinkercad': tinkercadKnowledge,
  'makecode-microbit': microbitKnowledge,
  'makecode-arcade': arcadeKnowledge,
  'code': codeKnowledge,
  'ia': iaKnowledge,
  'python': pythonKnowledge,
  'html': htmlKnowledge,
  'appinventor': appinventorKnowledge
};

function extractUuid(val) {
  if (!val) return null;
  if (val.includes('notebooklm.google.com/notebook/')) {
    const parts = val.split('/notebook/');
    return parts[1].split(/[?#\/]/)[0];
  }
  return val.trim();
}

// Mapeo de planetas unificado con IDs de lib/planets.js y variables de entorno de NotebookLM
const NOTEBOOK_MAP = {
  'code':              extractUuid(process.env.NB_CODE),
  'scratch':           extractUuid(process.env.NB_SCRATCH),
  'makecode-microbit': extractUuid(process.env.NB_MAKECODE_MICROBIT),
  'makecode-arcade':   extractUuid(process.env.NB_MAKECODE_ARCADE),
  'tinkercad':         extractUuid(process.env.NB_TINKERCAD),
  'arduino':           extractUuid(process.env.NB_ARDUINO),
  'appinventor':       extractUuid(process.env.NB_APPINVENTOR),
  'ia':                extractUuid(process.env.NB_LEARNINGML),
  'python':            extractUuid(process.env.NB_PYTHON),
  'html':              extractUuid(process.env.NB_HTML),
};

export async function POST(req) {
  const startTime = Date.now();
  try {
    const { userId, mode, message, history, planet, level, missionType, missionTheme, randomSeed, excludeList } = await req.json();
    const studentLevel = level || 'Junior';
    const searchPlanet = (planet || "scratch").toLowerCase();
    
    const planetData = PLANETS.find(p => 
      p.id.toLowerCase() === searchPlanet || 
      p.name.toLowerCase() === searchPlanet
    );
    
    const planetId = planetData?.id || 'scratch';
    const planetName = planetData?.name || 'Dojo Flow';

    console.log(`[Tutor API] Request for ${planetId} (${mode}) - Level: ${studentLevel} - Type: ${missionType} - Theme: ${missionTheme}`);

    // --- NUEVA PRIORIDAD 1: CONOCIMIENTO MAESTRO (Desde Supabase) ---
    let masterKnowledge = null;
    try {
      const { data: kData } = await supabase
        .from('planet_knowledge')
        .select('knowledge_data')
        .eq('planet_id', planetId)
        .maybeSingle();
      
      if (kData) {
        masterKnowledge = kData.knowledge_data;
        console.log(`[Tutor API] Conocimiento maestro cargado para ${planetId}`);
      }
    } catch (kError) {
      console.warn(`[Tutor API] No se pudo cargar el conocimiento de Supabase:`, kError.message);
    }

    // --- NUEVA PRIORIDAD 2: CONOCIMIENTO LOCAL (Fallback si no hay en Supabase) ---
    if (!masterKnowledge) {
      try {
        const localKnowledge = STATIC_KNOWLEDGE[planetId];
        if (localKnowledge) {
          masterKnowledge = localKnowledge.knowledge_base;
          console.log(`[Tutor API] Conocimiento cargado desde JSON LOCAL para ${planetId}`);
        }
      } catch (lError) {
        console.warn(`[Tutor API] No hay fallback local para ${planetId}:`, lError.message);
      }
    }

    // --- NUEVA PRIORIDAD: CONTEXTO DE RETO (Para validación) ---
    let challengeContext = "";
    if (mode === 'validador' && userId) {
      try {
        const { data: cData } = await supabase
          .from('user_challenges')
          .select('challenge_id, challenge_name, difficulty, evidence_url')
          .eq('student_id', userId)
          .eq('planet_id', planetId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cData) {
          challengeContext = `\nRETO A VALIDAR:\n- ID: ${cData.challenge_id}\n- Nombre: ${cData.challenge_name || 'No especificado'}\n- Dificultad: ${cData.difficulty || 'No especificada'}\n- Evidencia: ${cData.evidence_url || 'No proporcionada'}\n`;
          console.log(`[Tutor API] Contexto de reto cargado para ${userId}`);
        }
      } catch (cError) {
        console.warn(`[Tutor API] No se pudo cargar el contexto del reto:`, cError.message);
      }
    }

    // --- PRIORIDAD 2: NOTEBOOKLM (Si estamos en local y hay ID configurado) ---
    const isLocal = process.env.NODE_ENV === 'development' || process.env.HOSTNAME === 'localhost';
    const notebookId = NOTEBOOK_MAP[planetId];

    if (isLocal && notebookId) {
      try {
        console.log(`[Tutor API] Intentando conectar con NotebookLM para ${planetId}...`);
        const notebookUrl = `https://notebooklm.google.com/notebook/${notebookId}`;
        
        let promptTemplate = "";
        
        // Inyectamos el conocimiento maestro si existe para ayudar a NotebookLM o como contexto extra
        const knowledgeContext = masterKnowledge ? `\nCONOCIMIENTO DE REFERENCIA:\n${JSON.stringify(masterKnowledge)}\n` : "";

        if (mode === 'mission_generator') {
          promptTemplate = `Actúa como el Sensei Socrático de DojoFlow. Genera una Misión Especial para un alumno:
- Nivel: ${studentLevel}
- Planeta: ${planetName}
- Tipo de Reto: ${missionType || 'Aleatorio'}
- Tema: ${missionTheme || 'Cualquiera'}
- Semilla Aleatoria (Seed): ${randomSeed || Date.now()}
- EVITAR REPETIR ESTOS TÍTULOS: ${JSON.stringify(excludeList || [])}
${knowledgeContext}
La respuesta DEBE ser exclusivamente un objeto JSON válido con estos campos:
{
  "title": "Título épico Y DIFERENTE A LA LISTA DE EXCLUIDOS",
  "description": "Narrativa espacial/dojo variada y original",
  "objective": "Reto práctico concreto y diferente a misiones previas",
  "learning_objectives": ["obj1", "obj2"],
  "sensei_tips": "Breve consejo socrático (sin solución)",
  "estimated_time": "Tiempo estimado (ej: 20 min)",
  "reward_xp": 50,
  "recommended_resources": ["recurso1", "recurso2"]
}
IMPORTANTE: Cambia la estructura narrativa y el objetivo técnico en cada generación. Usa la Semilla ${randomSeed} para variar tu creatividad.
Usa exclusivamente el conocimiento de este cuaderno y el contexto de referencia proporcionado. No entregues código.`;
        } else {
          promptTemplate = `Contexto: El alumno está en el planeta ${planetName}. 
Nivel del alumno: ${studentLevel}.
Modo: ${mode === 'validador' ? 'Validación de reto' : 'Consulta general'}.
${challengeContext}
Historial reciente: ${JSON.stringify(history?.slice(-3))}
${knowledgeContext}
Pregunta: ${message}

Responde como el Sensei de DojoFlow. Sé socrático y usa analogías.
REGLA DE VALIDACIÓN:
- Si el modo es 'Validación de reto', concéntrate en el reto '${challengeContext.match(/Nombre: (.*)/)?.[1] || 'actual'}'.
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

    // --- PRIORIDAD 3: GEMINI (Con Contexto Maestro) ---
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY no configurada');

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Construimos las instrucciones del sistema enriquecidas con el conocimiento maestro
    const masterContextPrompt = masterKnowledge ? 
      `USA ESTE CONOCIMIENTO MAESTRO COMO BASE:\n${JSON.stringify(masterKnowledge)}\n\n` : 
      "Usa tu conocimiento general sobre programación educativa.";

    const systemPromptBase = `Eres el Sensei de DojoFlow, un tutor experto en programación inspirado en la pedagogía de @tecnohelmantica.
         PLANETA ACTUAL: ${planetName}.
         NIVEL DEL ALUMNO: ${studentLevel}.
         ${challengeContext}
         ${masterContextPrompt}
         REGLAS CRÍTICAS: 
         1. Nunca des el código directo. 
         2. Usa pistas graduadas y analogías. 
         3. Si el modo es 'validador', concéntrate en el reto mencionado arriba.
         4. Si el alumno es '${studentLevel}' y es Junior, haz preguntas muy simples.
         5. NO hagas cuestionarios de varias preguntas. Haz una sola pregunta clara.
         6. Si el alumno demuestra entender lo básico de su reto, incluye [VALIDADO] en tu respuesta.
         7. Si es Arduino (Pro), usa C++ textual.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest", 
      systemInstruction: mode === 'mission_generator' ? 
        `Eres el Sensei de DojoFlow. Genera una Misión Especial en JSON para nivel ${studentLevel}, planeta ${planetName}.
         Semilla de aleatoriedad: ${randomSeed}.
         EVITAR REPETIR TEMAS O TÍTULOS DE: ${JSON.stringify(excludeList || [])}.
         ${masterContextPrompt}
         Campos obligatorios: title, description, objective, learning_objectives (array), sensei_tips, estimated_time, reward_xp, recommended_resources (array).
         No des código. Sé socrático y extremadamente creativo para no repetirte.` :
        systemPromptBase
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

        // Solo inicializamos el chat si quedan mensajes válidos en el historial
        if (sanitizedHistory.length > 0) {
            const chat = model.startChat({ history: sanitizedHistory });
            const result = await chat.sendMessage(cleanMessage);
            responseText = result.response.text();
        } else {
            const result = await model.generateContent(cleanMessage);
            responseText = result.response.text();
        }
    } else {
        const result = await model.generateContent(cleanMessage);
        responseText = result.response.text();
    }

    await saveToHistory(userId, planetId, planetName, cleanMessage, responseText, history);
    return NextResponse.json({ success: true, text: responseText, source: 'gemini' });

  } catch (error) {
    console.error('[Tutor API Error]:', error);
    
    // Identificar el tipo de error (especialmente cuotas/rate limits) y formular una respuesta detallada
    let friendlyError = 'El Sensei está en meditación profunda en este momento. Por favor, inténtalo de nuevo en unos instantes.';
    if (error.message && (error.message.includes('429') || error.message.includes('quota') || error.message.includes('Quota') || error.status === 429)) {
      friendlyError = '¡Dojo saturado! El Sensei está recibiendo demasiadas preguntas simultáneas (Límite de cuota Gemini API). Por favor, espera 10-15 segundos y vuelve a intentarlo.';
    } else if (error.message && (error.message.includes('API key') || error.message.includes('key not found') || error.status === 400)) {
      friendlyError = 'Configuración del Dojo incompleta: La clave API de Gemini no está configurada o no es válida.';
    }

    return NextResponse.json({ 
      success: false, 
      error: friendlyError, 
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


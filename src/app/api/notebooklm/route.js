import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = "force-dynamic";

// Helper para crear cliente de Supabase bajo demanda
function getSupabaseClient(useServiceKey = false) {
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
    
    return createClient(supabaseUrl, useServiceKey ? serviceKey : anonKey);
}

// --- UUID Extractor ---
function extractUuid(val) {
    if (!val) return null;
    if (val.includes('notebooklm.google.com/notebook/')) {
        const parts = val.split('/notebook/');
        return parts[1].split(/[?#\/]/)[0];
    }
    return val.trim();
}

const MASTER_PROFESOR_ID = '5ec7cea5-1dfa-461f-8a07-ecf1da1854a6';

// Mapeo de IDs de planetas (slugs) a nombres en la DB (recursos_docentes)
const PLANET_TO_TECH_NAME = {
    'code': 'Code.org',
    'scratch': 'Scratch',
    'makecode-microbit': 'Makecode micro:bit',
    'makecode-arcade': 'MakeCode Arcade',
    'tinkercad': 'Diseño 3D y Codeblocks',
    'arduino': 'Arduino',
    'appinventor': 'App Inventor',
    'ia': 'LearningML',
    'python': 'Python',
    'html': 'HTML / CSS / JS'
};

// --- Planet to Notebook Mapping (Unificado con src/lib/planets.js) ---
const PLANET_TO_NOTEBOOK = {
    'code':              extractUuid(process.env.NB_CODE),
    'scratch':           extractUuid(process.env.NB_SCRATCH),
    'makecode-microbit': extractUuid(process.env.NB_MAKECODE_MICROBIT),
    'makecode-arcade':   extractUuid(process.env.NB_MAKECODE_ARCADE),
    'tinkercad': extractUuid(process.env.NB_TINKERCAD),
    'arduino':           extractUuid(process.env.NB_ARDUINO),
    'appinventor':       extractUuid(process.env.NB_APPINVENTOR),
    'ia':                extractUuid(process.env.NB_LEARNINGML),
    'python':            extractUuid(process.env.NB_PYTHON),
    'html':              extractUuid(process.env.NB_HTML),
};

export async function POST(req) {
    try {
        const body = await req.json();
        const { planetId, promptData, userId } = body;

        if (!promptData.action) {
            return NextResponse.json({ error: 'Action missing' }, { status: 400 });
        }

        const notebookId = PLANET_TO_NOTEBOOK[planetId?.toLowerCase()];
        if (!notebookId) {
            return NextResponse.json({ success: false, error: `No se encontró ID de cuaderno para el planeta: ${planetId}` }, { status: 404 });
        }

        const notebookUrl = `https://notebooklm.google.com/notebook/${notebookId}`;
        const finalPrompt = getCustomPrompt(promptData.action);

        if (!process.env.NOTEBOOKLM_COOKIES) {
            return NextResponse.json({ 
                success: false, 
                error: 'Orquestador Offline: Requiere configuración del administrador.',
                isOffline: true 
            }, { status: 401 });
        }

        // --- Importación Directa del Fetcher ---
        const { fetchResource } = await import('./fetcher');
        
        const resultText = await fetchResource(notebookUrl, finalPrompt);

        if (userId) {
            let dbType = promptData.action;
            if (dbType.toLowerCase().includes('cuestionario')) dbType = 'Quiz';
            if (dbType.toLowerCase().includes('mapa')) dbType = 'Mapa Mental';
            if (dbType.toLowerCase().includes('slide')) dbType = 'Slide';
            if (dbType.toLowerCase().includes('podcast')) dbType = 'Podcast';
            if (dbType.toLowerCase().includes('infografia')) dbType = 'Infografia';

            const supabase = getSupabaseClient(true);
            await supabase.from('recursos_docentes').insert({
                profesor_id: userId, 
                tecnologia: planetId, 
                tipo_recurso: dbType,
                nombre_recurso: `${dbType} de ${planetId.toUpperCase()}: ${new Date().toLocaleDateString()}`,
                contenido: { 
                    markdown: resultText, 
                    meta: { 
                        timestamp: new Date().toISOString(),
                        isGlobal: true,
                        visto: 0
                    } 
                }
            });
        }

        return NextResponse.json({ success: true, result: resultText });
    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({ error: 'Server error: ' + error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const tecnologiaId = searchParams.get('tecnologia');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'UserId missing' }, { status: 400 });
        }

        const supabase = getSupabaseClient();
        let query = supabase
            .from('recursos_docentes')
            .select('*')
            .or(`profesor_id.eq.${userId},profesor_id.eq.${MASTER_PROFESOR_ID}`);

        // Si se pide una tecnología específica, aplicamos el filtro
        // Nota: No filtramos directamente en la query para permitir nombres legacy (ej. "Code.org" vs "code")
        // pero cargamos todo y el frontend o nosotros aquí podemos normalizar.
        // Para rendimiento, si hay muchos, se podría mejorar.
        
        const { data, error } = await query.order('fecha_creacion', { ascending: false });

        if (error) {
            console.error('[API GET Resources] Supabase Error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, recursos: data });
    } catch (err) {
        console.error('[API GET Resources] Fatal Error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

function getCustomPrompt(action) {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('cuestionario')) {
        return `Genera un Cuestionario Interactivo de 5 preguntas.`;
    }
    if (lowerAction.includes('retos')) {
        return `Extrae retos prácticos en formato JSON.`;
    }
    return `Genera un recurso educativo detallado de tipo: ${action}.`;
}

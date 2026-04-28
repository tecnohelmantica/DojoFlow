import dotenv from 'dotenv';
import { fetchResource } from '../src/app/api/notebooklm/fetcher.js';

dotenv.config({ path: '.env.local' });

/**
 * Script de diagnóstico para el Sensei
 * Verifica si los cuadernos configurados en .env.local son accesibles.
 */
async function diagnose() {
    console.log('--- DIAGNÓSTICO DEL SENSEI ---');
    
    const notebooks = [
        { name: 'SCRATCH', id: process.env.NB_SCRATCH },
        { name: 'ARDUINO', id: process.env.NB_ARDUINO }
    ];

    for (const nb of notebooks) {
        if (!nb.id) {
            console.log(`[${nb.name}] ❌ No configurado en .env.local`);
            continue;
        }

        console.log(`[${nb.name}] Intentando conectar con ID: ${nb.id}...`);
        try {
            const url = `https://notebooklm.google.com/notebook/${nb.id}`;
            const res = await fetchResource(url, 'Hola Sensei, ¿estás ahí? Responde brevemente.');
            console.log(`[${nb.name}] ✅ Respuesta: ${res.substring(0, 50)}...`);
        } catch (e) {
            console.log(`[${nb.name}] ❌ Error: ${e.message}`);
        }
    }
}

diagnose();

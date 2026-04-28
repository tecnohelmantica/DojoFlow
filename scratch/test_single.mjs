
import { fetchResource } from '../src/app/api/notebooklm/fetcher.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    const notebookId = process.env.NB_SCRATCH;
    const url = `https://notebooklm.google.com/notebook/${notebookId}`;
    
    console.log(`Probando conexión con el cuaderno de Scratch: ${url}`);
    
    try {
        const response = await fetchResource(url, 'Hola Sensei, responde solo con la palabra "OK" si puedes leerme.');
        console.log('--- RESPUESTA RECIBIDA ---');
        console.log(response);
        console.log('--------------------------');
    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        if (error.message.includes('sesión ha caducado')) {
            console.log('💡 RECOMENDACIÓN: Ejecuta "npm run sensei:login" para renovar la sesión.');
        }
    }
}

test();

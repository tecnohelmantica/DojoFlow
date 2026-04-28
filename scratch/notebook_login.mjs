import { runManualLogin } from '../src/app/api/notebooklm/fetcher.js';

/**
 * Script para automatizar el login de NotebookLM
 * Ejecución: npm run sensei:login
 */
async function start() {
    try {
        console.log('--- INICIANDO ASISTENTE DE LOGIN ---');
        await runManualLogin();
        console.log('--- PROCESO FINALIZADO ---');
        process.exit(0);
    } catch (error) {
        console.error('Error durante el login:', error);
        process.exit(1);
    }
}

start();

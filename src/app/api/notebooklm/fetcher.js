import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

// Directorio para persistir la sesión de Google
const SESSION_DIR = path.join(process.cwd(), '.notebooklm_session');

/**
 * Función para abrir el navegador y permitir al usuario loguearse manualmente.
 * Una vez logueado, la sesión se guarda en .notebooklm_session.
 */
export async function runManualLogin() {
    console.log('--- INICIANDO LOGIN MANUAL ---');
    console.log('Se abrirá una ventana de Chrome. Por favor, inicia sesión en tu cuenta de Google.');
    console.log('Una vez que veas tus cuadernos de NotebookLM, puedes cerrar el navegador o volver aquí.');
    
    if (!fs.existsSync(SESSION_DIR)) {
        fs.mkdirSync(SESSION_DIR, { recursive: true });
    }

    const context = await chromium.launchPersistentContext(SESSION_DIR, {
        headless: false, // Abrir ventana visible
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 },
        args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
    });

    const page = await context.newPage();
    await page.goto('https://notebooklm.google.com/', { waitUntil: 'networkidle' });

    console.log('Esperando a que el usuario termine el login (tienes 5 minutos)...');
    
    // Esperar a que aparezca un elemento que indique que estamos logueados (ej. el botón de crear notebook o el avatar)
    try {
        await page.waitForSelector('button:has-text("Create"), .user-avatar, [aria-label*="Google Account"]', { timeout: 300000 });
        console.log('¡Login detectado con éxito!');
    } catch (e) {
        console.log('Tiempo de espera agotado o ventana cerrada.');
    }

    await context.close();
    console.log('Sesión guardada en .notebooklm_session. Ya no necesitarás actualizar cookies manualmente.');
}

/**
 * Versión mejorada de fetchResource que usa la sesión persistente.
 */
export async function fetchResource(notebookUrl, prompt) {
    console.log('[NotebookLM] Usando sesión persistente para acceder...');
    
    if (!fs.existsSync(SESSION_DIR)) {
        console.warn('⚠️ No se encontró sesión persistente. Por favor, ejecuta el script de login manual primero.');
        // Fallback a cookies del env si existen, para no romper compatibilidad
        return await fetchResourceLegacy(notebookUrl, prompt);
    }

    const context = await chromium.launchPersistentContext(SESSION_DIR, {
        headless: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 },
        args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
    });

    try {
        const page = await context.newPage();
        page.setDefaultTimeout(300000);
        
        console.log('Navegando al cuaderno...');
        await page.goto(notebookUrl, { waitUntil: 'domcontentloaded' });

        // Verificamos si pide login
        const loginNeeded = await page.$('a:has-text("Sign in"), button:has-text("Sign in")');
        if (loginNeeded) {
            throw new Error('La sesión ha caducado. Por favor, ejecuta el login manual de nuevo.');
        }

        const selectors = [
            'textarea[placeholder*="Preguntar"]',
            'textarea[placeholder*="Haz"]',
            'textarea[placeholder*="Ask"]',
            'div[contenteditable="true"]',
            'textarea'
        ];
        
        let chatInput;
        for (const sel of selectors) {
            try {
                chatInput = await page.waitForSelector(sel, { timeout: 10000, state: 'visible' });
                if (chatInput) break;
            } catch(e) {}
        }

        if (!chatInput) throw new Error('No se pudo acceder al chat. ¿Sesión caducada?');

        console.log('Inyectando pregunta...');
        await chatInput.evaluate((el, text) => {
            if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') el.value = text;
            else el.innerText = text;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }, prompt);

        await page.keyboard.press('Enter');
        
        // Esperar respuesta
        console.log('Esperando respuesta del Sensei...');
        await page.waitForFunction(() => {
            const msgs = document.querySelectorAll('.chat-message, [role="log"], .conversation-turn');
            return msgs.length >= 2;
        }, { timeout: 240000 });

        await page.waitForTimeout(5000); 

        const result = await page.evaluate(() => {
            const nodes = document.querySelectorAll('.chat-message, [role="log"], .conversation-turn');
            return nodes.length > 0 ? nodes[nodes.length - 1].innerText : 'Error al extraer.';
        });

        console.log('¡Éxito!');
        await context.close();
        return result;

    } catch (error) {
        await context.close();
        throw error;
    }
}

// Mantenemos la lógica anterior como fallback por si el usuario no quiere usar persistencia
async function fetchResourceLegacy(notebookUrl, prompt) {
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    try {
        const cookieStr = process.env.NOTEBOOKLM_COOKIES || '';
        if (cookieStr) {
            const cookies = cookieStr.split(';').map(pair => {
                const [name, ...valueParts] = pair.trim().split('=');
                return { name, value: valueParts.join('='), domain: '.google.com', path: '/', secure: true, sameSite: 'None' };
            }).filter(c => c.name && c.value);
            await context.addCookies(cookies);
        }

        const page = await context.newPage();
        await page.goto(notebookUrl, { waitUntil: 'domcontentloaded' });
        
        const chatInput = await page.waitForSelector('textarea, div[contenteditable="true"]', { timeout: 15000 }).catch(() => null);
        if (!chatInput) throw new Error('Cookies caducadas o inválidas.');

        await chatInput.fill(prompt);
        await page.keyboard.press('Enter');
        
        await page.waitForFunction(() => document.querySelectorAll('.chat-message, [role="log"], .conversation-turn').length >= 2, { timeout: 120000 });
        await page.waitForTimeout(5000);
        
        const result = await page.evaluate(() => {
            const nodes = document.querySelectorAll('.chat-message, [role="log"], .conversation-turn');
            return nodes[nodes.length - 1]?.innerText || 'Error';
        });

        await browser.close();
        return result;
    } catch (e) {
        await browser.close();
        throw e;
    }
}

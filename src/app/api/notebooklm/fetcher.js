import { chromium } from 'playwright';

export async function fetchResource(notebookUrl, prompt) {
    // Usamos un perfil temporal para evitar bloqueos de SingletonLock
    // MODO HEADLESS OBLIGATORIO: Evita que el usuario vea la ventana del navegador
    const browser = await chromium.launch({
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    // Crear contexto con el User Agent correcto
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 }
    });

    try {
        // INYECTAR COOKIES DESDE EL .ENV
        const cookieStr = process.env.NOTEBOOKLM_COOKIES || '';
        if (cookieStr) {
            console.log('Inyectando cookies de sesión...');
            const cookies = cookieStr.split(';').map(pair => {
                const [name, ...valueParts] = pair.trim().split('=');
                return {
                    name: name,
                    value: valueParts.join('='),
                    domain: '.google.com',
                    path: '/',
                    secure: true,
                    sameSite: 'None'
                };
            }).filter(c => c.name && c.value);
            
            await context.addCookies(cookies);
        }

        const page = await context.newPage();
        page.setDefaultTimeout(300000); // 5 minutos de margen total
        
        console.log('Navegando al cuaderno...');
        await page.goto(notebookUrl, { waitUntil: 'domcontentloaded' });

        // Selectores de NotebookLM
        const selectors = [
            'textarea[placeholder*="Preguntar"]',
            'textarea[placeholder*="Haz"]',
            'textarea[placeholder*="Ask"]',
            'div[contenteditable="true"]',
            'textarea'
        ];
        
        let chatInput;
        console.log('Buscando chat...');
        
        // Espera ultra-corta: si no estamos logueados, fallamos rápido
        for (const sel of selectors) {
            try {
                chatInput = await page.waitForSelector(sel, { timeout: 3000, state: 'visible' });
                if (chatInput) break;
            } catch(e) {}
        }

        if (!chatInput) {
            console.log('No se entró directo. ¿Cookies caducadas? Intentando esperar un poco más...');
            chatInput = await page.waitForSelector('textarea, div[contenteditable="true"]', { timeout: 8000 }).catch(() => null);
        }

        if (!chatInput) throw new Error('No se pudo acceder al chat. Verifica tus cookies en .env.local');

        // Inyectar prompt
        console.log('Escribiendo pregunta...');
        await chatInput.evaluate((el, text) => {
            if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') el.value = text;
            else el.innerText = text;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }, prompt);

        await page.keyboard.press('Enter');
        
        // Intentar hacer clic en el botón de enviar por si acaso
        console.log('Asegurando envío...');
        const sendButtons = [
            'button[aria-label*="Enviar"]',
            'button[aria-label*="Send"]',
            'button:has(mat-icon:has-text("send"))',
            'button.send-button'
        ];
        for (const btnSel of sendButtons) {
            try {
                const btn = await page.$(btnSel);
                if (btn) {
                    await btn.click();
                    break;
                }
            } catch(e) {}
        }

        // Esperar respuesta
        console.log('Esperar respuesta (este paso es lento)...');
        await page.waitForFunction(() => {
            const msgs = document.querySelectorAll('.chat-message, [role="log"], .conversation-turn');
            return msgs.length >= 2;
        }, { timeout: 240000 });

        await page.waitForTimeout(8000); // Pausa para renderizado

        const result = await page.evaluate(() => {
            const nodes = document.querySelectorAll('.chat-message, [role="log"], .conversation-turn');
            return nodes.length > 0 ? nodes[nodes.length - 1].innerText : 'Error al extraer.';
        });

        console.log('¡Éxito!');
        await browser.close();
        return result;

    } catch (error) {
        if (browser) await browser.close();
        throw error;
    }
}

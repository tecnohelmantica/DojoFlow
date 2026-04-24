import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  console.log('🚀 Iniciando vinculador de DojoFlow...');
  
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', 'notebooklm-mcp'],
    env: {
      ...process.env,
      NOTEBOOKLM_DATA_DIR: './sensei-session'
    }
  });

  const client = new Client(
    { name: 'auth-tool', version: '1.0.0' },
    { capabilities: {} }
  );

  try {
    await client.connect(transport);
    console.log('✅ Conectado al servidor MCP.');
    console.log('🌐 Abriendo ventana de login de Google...');

    // Llamamos a la herramienta setup_auth
    const result = await client.callTool({
      name: 'setup_auth',
      arguments: {}
    });

    console.log('📝 Resultado:', result.content[0].text);
    console.log('\n⚠️  IMPORTANTE: No cierres esta terminal hasta que hayas terminado el login en la ventana de Chrome.');
    
    // Mantener el proceso vivo para que no se cierre la sesión mientras se loguea
    await new Promise(resolve => setTimeout(resolve, 120000)); // 2 minutos para loguearse

  } catch (error) {
    console.error('❌ Error al vincular:', error.message);
  } finally {
    await client.close();
  }
}

main();

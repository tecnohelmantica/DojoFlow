import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';

async function main() {
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', 'notebooklm-mcp'],
    env: {
      ...process.env,
      NOTEBOOKLM_DATA_DIR: path.resolve(process.cwd(), 'sensei-session'),
      NODE_ENV: 'production'
    }
  });

  const client = new Client(
    { name: 'test-client', version: '1.0.0' },
    { capabilities: {} }
  );

  try {
    await client.connect(transport);
    const tools = await client.listTools();
    console.log('Tools:', JSON.stringify(tools, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

main();

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function test() {
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "notebooklm-mcp"],
  });
  
  const client = new Client({ name: "test", version: "1.0.0" }, { capabilities: {} });
  await client.connect(transport);
  
  const result = await client.listTools();
  const askQuestion = result.tools.find(t => t.name === 'ask_question');
  console.log(JSON.stringify(askQuestion, null, 2));
  
  await client.close();
}

test();

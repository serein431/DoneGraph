import { createDoneGraphMcpServer, main } from "./server.js";

export { createDoneGraphMcpServer, main };

main().catch((error: unknown) => {
  process.stderr.write(`DoneGraph MCP server error: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});

import { Server as IServer, Transport, ErrorCode, McpError } from './types';

export class Server implements IServer {
  private handlers: Map<symbol, (request: any) => Promise<any>> = new Map();
  public onerror: (error: Error) => void = console.error;

  constructor(
    private info: { name: string; version: string },
    private config: { capabilities: { tools: {} } }
  ) {}

  async connect(transport: Transport): Promise<void> {
    await transport.connect();
  }

  async close(): Promise<void> {
    // Cleanup if needed
  }

  setRequestHandler<T>(schema: symbol, handler: (request: T) => Promise<any>): void {
    this.handlers.set(schema, handler);
  }

  async handleRequest(schema: symbol, request: any): Promise<any> {
    const handler = this.handlers.get(schema);
    if (!handler) {
      throw new McpError(ErrorCode.MethodNotFound, `No handler for schema: ${schema.toString()}`);
    }
    return handler(request);
  }
}

export interface Server {
  connect(transport: Transport): Promise<void>;
  close(): Promise<void>;
  onerror: (error: Error) => void;
  setRequestHandler<T>(schema: any, handler: (request: T) => Promise<any>): void;
}

export interface Transport {
  connect(): Promise<void>;
  close(): Promise<void>;
}

export interface CallToolRequest {
  params: {
    name: string;
    arguments: any;
  };
}

export class McpError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'McpError';
  }
}

export const ErrorCode = {
  MethodNotFound: 'METHOD_NOT_FOUND',
  InvalidRequest: 'INVALID_REQUEST',
  InternalError: 'INTERNAL_ERROR',
} as const;

export const ListToolsRequestSchema = Symbol('ListToolsRequestSchema');
export const CallToolRequestSchema = Symbol('CallToolRequestSchema');

import { z } from 'zod';

// Zod schemas for validation
export const McpEnvironmentVariable = z.record(z.string());

export const McpServerConfig = z.object({
  command: z.string(),
  args: z.array(z.string()),
  env: McpEnvironmentVariable.optional(),
  disabled: z.boolean().optional(),
  autoApprove: z.array(z.string()).optional()
});

export const McpSettings = z.object({
  mcpServers: z.record(McpServerConfig)
});

// TypeScript types derived from Zod schemas
export type McpEnvironmentVariable = z.infer<typeof McpEnvironmentVariable>;
export type McpServerConfig = z.infer<typeof McpServerConfig>;
export type McpSettings = z.infer<typeof McpSettings>;

// API request/response types
export interface AddServerRequest {
  name: string;
  config: McpServerConfig;
}

export interface UpdateServerRequest {
  name: string;
  config: Partial<McpServerConfig>;
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ServerStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  lastError?: string;
  tools?: string[];
}

// Server management operations
export interface ServerOperation {
  type: 'add' | 'update' | 'remove' | 'enable' | 'disable';
  name: string;
  config?: McpServerConfig;
}

// Event types for WebSocket updates
export interface ServerEvent {
  type: 'status' | 'config' | 'error';
  name: string;
  data: any;
}

// Configuration file paths
export interface ConfigPaths {
  settingsFile: string;
  backupDir: string;
}

// Server manager interface
export interface ServerManager {
  addServer(name: string, config: McpServerConfig): Promise<void>;
  removeServer(name: string): Promise<void>;
  updateServer(name: string, config: Partial<McpServerConfig>): Promise<void>;
  enableServer(name: string): Promise<void>;
  disableServer(name: string): Promise<void>;
  getServerStatus(name: string): Promise<ServerStatus>;
  getAllServers(): Promise<Record<string, McpServerConfig>>;
  validateConfig(config: McpServerConfig): boolean;
}

// API routes
export const API_ROUTES = {
  servers: '/api/servers',
  server: (name: string) => `/api/servers/${name}`,
  status: '/api/status',
  config: '/api/config',
  validate: '/api/validate',
} as const;

// WebSocket events
export const WS_EVENTS = {
  statusUpdate: 'server:status',
  configUpdate: 'server:config',
  error: 'server:error',
} as const;

// Error types
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ServerOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServerOperationError';
  }
}

#!/usr/bin/env node
import { Server } from './server';
import { StdioServerTransport } from './stdio';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  CallToolRequest,
} from './types';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as fg from 'fast-glob';

class SearchServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'search-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    this.server.onerror = (error: Error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private async searchInFiles(directory: string, pattern: string, fileTypes?: string[]): Promise<string> {
    const filePattern = fileTypes?.length ? `**/*.{${fileTypes.join(',')}}` : '**/*';
    const files = await fg(filePattern, { 
      cwd: directory,
      ignore: ['**/node_modules/**', '**/build/**', '**/dist/**', '**/.git/**']
    });

    let results = '';
    for (const file of files) {
      try {
        const content = await fs.readFile(path.join(directory, file), 'utf-8');
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(pattern)) {
            results += `\nFile: ${file}:${i + 1}\n${lines[i].trim()}\n`;
          }
        }
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    }
    return results || 'No matches found';
  }

  private async findFiles(directory: string, pattern: string): Promise<string[]> {
    return fg(pattern, { 
      cwd: directory,
      ignore: ['**/node_modules/**', '**/build/**', '**/dist/**', '**/.git/**']
    });
  }

  private async findCodeDefinitions(directory: string, fileTypes: string[]): Promise<string> {
    const pattern = `**/*.{${fileTypes.join(',')}}`;
    const files = await fg(pattern, { 
      cwd: directory,
      ignore: ['**/node_modules/**', '**/build/**', '**/dist/**', '**/.git/**']
    });

    let definitions = '';
    const definitionRegex = /^(?:export\s+)?(?:class|function|interface|type|const|let|var)\s+(\w+)/gm;

    for (const file of files) {
      try {
        const content = await fs.readFile(path.join(directory, file), 'utf-8');
        let match;
        while ((match = definitionRegex.exec(content)) !== null) {
          definitions += `${file}: ${match[1]}\n`;
        }
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    }
    return definitions || 'No definitions found';
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_in_files',
          description: 'Search for a pattern in files within a directory',
          inputSchema: {
            type: 'object',
            properties: {
              directory: { 
                type: 'string',
                description: 'Directory to search in'
              },
              pattern: { 
                type: 'string',
                description: 'Pattern to search for'
              },
              fileTypes: {
                type: 'array',
                items: { type: 'string' },
                description: 'File extensions to search in (e.g., ["ts", "js"])'
              }
            },
            required: ['directory', 'pattern']
          }
        },
        {
          name: 'find_files',
          description: 'Find files matching a glob pattern',
          inputSchema: {
            type: 'object',
            properties: {
              directory: {
                type: 'string',
                description: 'Directory to search in'
              },
              pattern: {
                type: 'string',
                description: 'Glob pattern (e.g., "**/*.ts")'
              }
            },
            required: ['directory', 'pattern']
          }
        },
        {
          name: 'find_code_definitions',
          description: 'Find code definitions (classes, functions, etc.)',
          inputSchema: {
            type: 'object',
            properties: {
              directory: {
                type: 'string',
                description: 'Directory to search in'
              },
              fileTypes: {
                type: 'array',
                items: { type: 'string' },
                description: 'File extensions to search in (e.g., ["ts", "js"])'
              }
            },
            required: ['directory', 'fileTypes']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      try {
        switch (request.params.name) {
          case 'search_in_files': {
            const { directory, pattern, fileTypes } = request.params.arguments as {
              directory: string;
              pattern: string;
              fileTypes?: string[];
            };
            const results = await this.searchInFiles(directory, pattern, fileTypes);
            return {
              content: [{
                type: 'text',
                text: results
              }]
            };
          }

          case 'find_files': {
            const { directory, pattern } = request.params.arguments as {
              directory: string;
              pattern: string;
            };
            const files = await this.findFiles(directory, pattern);
            return {
              content: [{
                type: 'text',
                text: files.join('\n')
              }]
            };
          }

          case 'find_code_definitions': {
            const { directory, fileTypes } = request.params.arguments as {
              directory: string;
              fileTypes: string[];
            };
            const definitions = await this.findCodeDefinitions(directory, fileTypes);
            return {
              content: [{
                type: 'text',
                text: definitions
              }]
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Search error: ${error.message}`
          }],
          isError: true
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Search MCP server running on stdio');
  }
}

const server = new SearchServer();
server.run().catch(console.error);

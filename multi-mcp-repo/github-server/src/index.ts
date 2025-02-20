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
import { Octokit } from '@octokit/rest';

class GitHubServer {
  private server: Server;
  private octokit: Octokit;

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }

    this.octokit = new Octokit({ auth: token });
    
    this.server = new Server(
      {
        name: 'github-server',
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

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_issue',
          description: 'Create a new issue in a GitHub repository',
          inputSchema: {
            type: 'object',
            properties: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              title: { type: 'string', description: 'Issue title' },
              body: { type: 'string', description: 'Issue body' },
              labels: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Issue labels'
              },
            },
            required: ['owner', 'repo', 'title', 'body']
          }
        },
        {
          name: 'search_repos',
          description: 'Search for GitHub repositories',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' },
              sort: { 
                type: 'string', 
                enum: ['stars', 'forks', 'updated'],
                description: 'Sort criteria'
              },
              per_page: { 
                type: 'number', 
                minimum: 1,
                maximum: 100,
                description: 'Results per page'
              }
            },
            required: ['query']
          }
        },
        {
          name: 'list_repo_contents',
          description: 'List contents of a GitHub repository',
          inputSchema: {
            type: 'object',
            properties: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              path: { 
                type: 'string', 
                description: 'Path within repository (optional)'
              }
            },
            required: ['owner', 'repo']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      try {
        switch (request.params.name) {
          case 'create_issue': {
            const { owner, repo, title, body, labels } = request.params.arguments as {
              owner: string;
              repo: string;
              title: string;
              body: string;
              labels?: string[];
            };
            const response = await this.octokit.issues.create({
              owner,
              repo,
              title,
              body,
              labels
            });
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(response.data, null, 2)
              }]
            };
          }

          case 'search_repos': {
            const { query, sort = 'stars', per_page = 10 } = request.params.arguments as {
              query: string;
              sort?: 'stars' | 'forks' | 'updated';
              per_page?: number;
            };
            const response = await this.octokit.search.repos({
              q: query,
              sort,
              per_page
            });
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(response.data, null, 2)
              }]
            };
          }

          case 'list_repo_contents': {
            const { owner, repo, path = '' } = request.params.arguments as {
              owner: string;
              repo: string;
              path?: string;
            };
            const response = await this.octokit.repos.getContent({
              owner,
              repo,
              path
            });
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(response.data, null, 2)
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
            text: `GitHub API error: ${error.message}`
          }],
          isError: true
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('GitHub MCP server running on stdio');
  }
}

const server = new GitHubServer();
server.run().catch(console.error);

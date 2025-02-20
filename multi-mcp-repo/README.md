# MCP Server Repository

This repository contains multiple Model Context Protocol (MCP) servers that provide various tools and capabilities. Each server is implemented in TypeScript and follows a modular architecture for easy extension and maintenance.

## Architecture

Each server follows a common architecture:
- `types.ts`: Core type definitions and interfaces
- `server.ts`: Base server implementation
- `stdio.ts`: Standard I/O transport layer
- `index.ts`: Server-specific tool implementations

### Common Components
- Error handling with custom `McpError` class
- Standard I/O based communication
- Tool registration system
- Request/response handling

## Available Servers

### 1. GitHub Server
Located in `github-server/`, this server provides tools for interacting with GitHub's API:
- Create issues in repositories
- Search repositories
- List repository contents

Key Features:
- GitHub API integration via Octokit
- Token-based authentication
- Comprehensive error handling
- Input validation for all operations

### 2. Search Server
Located in `search-server/`, this server provides advanced search capabilities:
- Search for patterns in files
- Find files matching glob patterns
- Find code definitions (classes, functions, etc.)

Key Features:
- Fast file searching with glob patterns
- Code definition detection
- Configurable file type filtering
- Recursive directory traversal

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- PowerShell (for Windows)
- GitHub Personal Access Token (for GitHub server)

### Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd multi-mcp-repo
```

2. Set up GitHub server:
```bash
cd github-server
npm install
npm run build
```

3. Set up Search server:
```bash
cd ../search-server
npm install
npm run build
```

### Configuration

#### GitHub Server
1. Follow the instructions in `github-server/get-github-token.md` to obtain a GitHub token
2. Add the server configuration to your MCP settings file (`C:\Users\BigDSweetz\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["C:/Users/BigDSweetz/Desktop/Git/MCP/multi-mcp-repo/github-server/build/index.js"],
      "env": {
        "GITHUB_TOKEN": "your-token-here"
      }
    }
  }
}
```

#### Search Server
Add the server configuration to your MCP settings file:

```json
{
  "mcpServers": {
    "search": {
      "command": "node",
      "args": ["C:/Users/BigDSweetz/Desktop/Git/MCP/multi-mcp-repo/search-server/build/index.js"]
    }
  }
}
```

## Usage Examples

### GitHub Server

```typescript
// Create an issue
use_mcp_tool({
  server_name: "github",
  tool_name: "create_issue",
  arguments: {
    owner: "username",
    repo: "repo-name",
    title: "Bug report",
    body: "Found a bug in...",
    labels: ["bug"]
  }
});

// Search repositories
use_mcp_tool({
  server_name: "github",
  tool_name: "search_repos",
  arguments: {
    query: "language:typescript stars:>1000",
    sort: "stars",
    per_page: 10
  }
});
```

### Search Server

```typescript
// Search in files
use_mcp_tool({
  server_name: "search",
  tool_name: "search_in_files",
  arguments: {
    directory: "/path/to/search",
    pattern: "TODO:",
    fileTypes: ["ts", "js"]
  }
});

// Find code definitions
use_mcp_tool({
  server_name: "search",
  tool_name: "find_code_definitions",
  arguments: {
    directory: "/path/to/search",
    fileTypes: ["ts"]
  }
});
```

## Development

### Adding a New Server

1. Create a new directory for your server:
```bash
mkdir my-new-server
cd my-new-server
```

2. Copy the base implementation files:
- `types.ts`: Core type definitions
- `server.ts`: Base server implementation
- `stdio.ts`: Transport layer

3. Create your server implementation:
- Define your tools in `index.ts`
- Implement tool handlers
- Add any necessary dependencies

4. Set up the build process:
- Copy `tsconfig.json` from an existing server
- Update `package.json` with necessary dependencies
- Add build and start scripts

5. Test your server:
- Build the server
- Add configuration to MCP settings
- Test each tool's functionality

### Best Practices

1. Error Handling
- Use the `McpError` class for consistent error reporting
- Provide detailed error messages
- Handle all edge cases

2. Input Validation
- Define clear input schemas for each tool
- Validate all input parameters
- Provide meaningful error messages for invalid inputs

3. Documentation
- Document all tools and their parameters
- Provide usage examples
- Keep README up to date

4. Testing
- Test all tools with various inputs
- Test error conditions
- Test edge cases

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Acknowledgments

- Built with TypeScript
- Uses the Model Context Protocol
- Inspired by the MCP SDK

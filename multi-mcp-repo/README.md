# MCP Server Repository

A collection of Model Context Protocol (MCP) servers providing various tools and capabilities, along with a web-based management interface.

## Available Servers

### 1. GitHub Server
Located in `github-server/`, this server provides tools for interacting with GitHub's API:
- Create issues in repositories
- Search repositories
- List repository contents

### 2. Search Server
Located in `search-server/`, this server provides advanced search capabilities:
- Search for patterns in files
- Find files matching glob patterns
- Find code definitions (classes, functions, etc.)

### 3. Manager Server
Located in `manager-server/`, this server provides a web GUI and API for managing MCP servers:
- Add/remove/update MCP servers
- Enable/disable servers
- Monitor server status
- Manage server configurations
- Backup and restore settings

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

4. Set up Manager server:
```bash
cd ../manager-server
npm run install:all  # Installs both backend and frontend dependencies
npm run build       # Builds both backend and frontend
```

### Configuration

#### GitHub Server
1. Follow the instructions in `github-server/get-github-token.md` to obtain a GitHub token
2. Add the server configuration to your MCP settings file:
```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["path/to/github-server/build/index.js"],
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
      "args": ["path/to/search-server/build/index.js"]
    }
  }
}
```

#### Manager Server
1. Start the manager server:
```bash
cd manager-server
npm start
```
2. Open http://localhost:3500 in your browser
3. Use the web interface to manage your MCP servers

## Development

### Running in Development Mode

Each server can be run in development mode with auto-reloading:

#### GitHub Server
```bash
cd github-server
npm run dev
```

#### Search Server
```bash
cd search-server
npm run dev
```

#### Manager Server
```bash
cd manager-server
npm run dev  # Starts both backend and frontend in dev mode
```

### Adding a New Server

1. Create a new directory for your server
2. Copy the base implementation files:
   - `types.ts`: Core type definitions
   - `server.ts`: Base server implementation
   - `stdio.ts`: Transport layer
3. Implement your server's specific tools and functionality
4. Add build and start scripts
5. Add the server to the MCP settings file

### Architecture

Each server follows a common architecture:
- TypeScript-based implementation
- Standard I/O based communication
- Tool registration system
- Error handling with custom error types
- Input validation using schemas

The Manager server additionally includes:
- Express.js backend API
- React frontend with Material-UI
- Configuration management
- Backup/restore functionality

## API Documentation

### Manager Server API

The Manager server provides a REST API for managing MCP servers:

- `GET /api/servers` - List all servers
- `POST /api/servers` - Add a new server
- `GET /api/servers/:name` - Get server details
- `PUT /api/servers/:name` - Update server configuration
- `DELETE /api/servers/:name` - Remove a server
- `POST /api/servers/:name/enable` - Enable a server
- `POST /api/servers/:name/disable` - Disable a server
- `GET /api/servers/:name/status` - Get server status
- `GET /api/backups` - List configuration backups
- `POST /api/backups/:name/restore` - Restore from backup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

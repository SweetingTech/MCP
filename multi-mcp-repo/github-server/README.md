# GitHub MCP Server

This MCP server provides tools for interacting with GitHub's API. It allows you to:
- Create issues in repositories
- Search for repositories
- List repository contents

## Setup

1. Install dependencies:
```bash
npm install
```

2. Get a GitHub token:
See [get-github-token.md](./get-github-token.md) for instructions on obtaining and configuring your GitHub token.

3. Build the server:
```bash
npm run build
```

## Available Tools

### create_issue
Creates a new issue in a GitHub repository.

Parameters:
- `owner`: Repository owner
- `repo`: Repository name
- `title`: Issue title
- `body`: Issue body
- `labels`: (optional) Array of label names

### search_repos
Search for GitHub repositories.

Parameters:
- `query`: Search query
- `sort`: (optional) Sort criteria ('stars', 'forks', or 'updated')
- `per_page`: (optional) Results per page (1-100)

### list_repo_contents
List contents of a GitHub repository.

Parameters:
- `owner`: Repository owner
- `repo`: Repository name
- `path`: (optional) Path within repository

## Example Usage

Once configured in your MCP settings, you can use these tools through the MCP interface:

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

# Getting Your GitHub Token

To use the GitHub MCP server, you'll need a GitHub Personal Access Token (PAT). Follow these steps to create one:

1. Go to GitHub.com and sign in to your account
2. Click your profile picture in the top right
3. Go to Settings > Developer settings > Personal access tokens > Tokens (classic)
4. Click "Generate new token" > "Generate new token (classic)"
5. Give your token a name (e.g., "MCP GitHub Server")
6. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org and team info)
   - `read:user` (Read user info)
7. Click "Generate token"
8. **IMPORTANT**: Copy your token immediately! You won't be able to see it again.

## Using Your Token

Once you have your token, you need to add it to the MCP settings file. Add it under the GitHub server configuration in:
`C:\Users\BigDSweetz\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

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

Replace "your-token-here" with the token you generated.

# MCP-Server-Installer

Register [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) servers directly from your VS Code settings, also if the installation of MCP-Servers is deactivated in GitHub Copilot.

## Features

- **Settings-driven** — Define MCP servers in your User or Workspace settings
- **Stdio & HTTP** — Supports local process servers (stdio) and remote HTTP endpoints
- **Live reload** — Servers update automatically when you change the settings, no restart needed
- **Windows compatible** — Handles `.bat`/`.cmd` files and `npx`/`npm` commands automatically

## Configuration

Open your `settings.json` and add entries to `mcpServerInstaller.servers`:

### Stdio Server (local process)

```jsonc
"mcpServerInstaller.servers": [
  {
    "name": "My MCP Server",
    "type": "stdio",
    "command": "node",
    "args": ["path/to/server.js"],
    "env": {
      "API_KEY": "your-key"
    },
    "cwd": "C:\\path\\to\\working\\dir"
  }
]
```

### HTTP Server (remote endpoint)

```jsonc
"mcpServerInstaller.servers": [
  {
    "name": "Remote MCP Server",
    "type": "http",
    "url": "https://api.example.com/mcp",
    "headers": {
      "Authorization": "Bearer your-token"
    }
  }
]
```

### Multiple Servers

You can register as many servers as you need:

```jsonc
"mcpServerInstaller.servers": [
  {
    "name": "Local Tools",
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-everything"]
  },
  {
    "name": "My API",
    "type": "http",
    "url": "https://mcp.example.com/sse"
  }
]
```

## Setting Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Display name shown in VS Code |
| `type` | `"stdio"` \| `"http"` | Yes | Transport type |
| `command` | `string` | stdio | Command to start the server process |
| `args` | `string[]` | — | Command-line arguments |
| `env` | `object` | — | Environment variables (`null` removes a variable) |
| `cwd` | `string` | — | Working directory for the process |
| `url` | `string` | http | Server endpoint URL |
| `headers` | `object` | — | Additional HTTP headers |

## Requirements

- VS Code **1.99** or later (MCP API support)
- GitHub Copilot extension (to use MCP tools in Copilot Chat)

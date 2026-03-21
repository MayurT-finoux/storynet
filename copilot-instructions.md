# VS Code Copilot Instructions - StoryNet

This file configures how GitHub Copilot works in this workspace, including MCP server connections.

## MCP Servers

[mcp-servers]
supabase = node /workspaces/storynet/mcp-servers/supabase/dist/index.js

## Setup Steps

1. **Build the Supabase MCP Server:**
   ```bash
   cd mcp-servers/supabase
   npm install
   npm run build
   ```

2. **Configure Supabase Environment:**
   - Create `.env` in `mcp-servers/supabase/`
   - Add your Supabase URL and API key (see `.env.example`)

3. **Reload VS Code:**
   - Press `Shift+F1` or use Command Palette → "Reload Window"

4. **Use Copilot with your Database:**
   - Ask Copilot to query your database
   - Example: "Get all stories from the database"
   - Example: "Create a new character named Sarah"

## Copilot Instructions for StoryNet

When using Copilot in this workspace, follow these patterns:

### Database Queries
- Use the `query_table` tool to fetch data
- Specify table name, columns, and filters clearly

### Creating Data
- Use `insert_record` for new records
- Ensure all required fields are provided

### Updating Data
- Use `update_record` with the record ID and fields to update
- Always specify which record you're updating

### Deleting Data  
- Use `delete_record` carefully - have you saved a backup recently?
- Always confirm the record ID before deletion

## Project Context

StoryNet is a canvas-based storytelling application with:
- **Stories** - Main narrative containers
- **Characters** - Entities in your story
- **Pages** - Text nodes on the canvas
- **Connections** - Relationships between pages
- **Annotations** - Notes and highlights

## Useful Copilot Queries

- "Show me all my stories and their character counts"
- "Create a backup of story #123"
- "Find all pages that mention the character named 'Alex'"
- "Show me the most complex connections in my story"

For more details on the Supabase MCP server, see `mcp-servers/supabase/README.md`.

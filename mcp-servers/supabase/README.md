# Supabase MCP Server Setup Guide

## What is This?

This is a Model Context Protocol (MCP) server that connects VS Code to your Supabase database. It allows you to query, insert, update, and delete data directly from your VS Code editor with Copilot's help.

## Installation

### 1. Install Dependencies

```bash
cd mcp-servers/supabase
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your Supabase credentials:

```bash
cp .env.example .env
```

Then edit `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your-service-role-key
```

Get these from your Supabase project dashboard:
- **SUPABASE_URL**: Project > Settings > Project URL
- **SUPABASE_API_KEY**: Project > Settings > API > Service Role Key (use service role for full access)

### 3. Build the Server

```bash
npm run build
```

## Available Tools

### `query_table`
Query data from your Supabase tables.

**Example:**
```
Tool: query_table
Arguments:
  table: "stories"
  select: "*"
  limit: 10
```

### `insert_record`
Insert a new record into a table.

**Example:**
```
Tool: insert_record
Arguments:
  table: "characters"
  data: {
    "name": "John Doe",
    "description": "Main protagonist"
  }
```

### `update_record`
Update an existing record by ID.

**Example:**
```
Tool: update_record
Arguments:
  table: "stories"
  id: "123e4567-e89b-12d3-a456-426614174000"
  data: {
    "title": "Updated Title"
  }
```

### `delete_record`
Delete a record by ID.

**Example:**
```
Tool: delete_record
Arguments:
  table: "pages"
  id: "123e4567-e89b-12d3-a456-426614174000"
```

### `call_rpc`
Call a PostgreSQL function (RPC) in your Supabase project.

**Example:**
```
Tool: call_rpc
Arguments:
  function_name: "get_story_stats"
  args: {
    "story_id": "123"
  }
```

## VS Code Configuration

Add this to your `.vscode/settings.json` or `copilot-instructions.md`:

```json
{
  "modelcontextprotocol": {
    "supabase": {
      "command": "node",
      "args": ["/workspaces/storynet/mcp-servers/supabase/dist/index.js"],
      "env": {
        "SUPABASE_URL": "${env:SUPABASE_URL}",
        "SUPABASE_API_KEY": "${env:SUPABASE_API_KEY}"
      }
    }
  }
}
```

Or use `copilot-instructions.md` at the workspace root:

```markdown
[mcp-servers]
supabase = node /workspaces/storynet/mcp-servers/supabase/dist/index.js
```

## Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

## Example Queries for StoryNet

### Get all stories
```
query_table
  table: "stories"
  select: "*"
```

### Get characters for a specific story
```
query_table
  table: "characters"
  filter: "story_id.eq.123"
```

### Create a new page
```
insert_record
  table: "pages"
  data: {
    "story_id": "123",
    "title": "Chapter 1",
    "content": "..."
  }
```

### Update a connection between pages
```
update_record
  table: "connections"
  id: "conn-123"
  data: {
    "label": "next_chapter"
  }
```

## Troubleshooting

**"Missing SUPABASE_URL or SUPABASE_API_KEY"**
- Make sure your `.env` file is in the `mcp-servers/supabase` directory
- Verify you copied the correct credentials from Supabase

**"Error: Relation does not exist"**
- Check your table name spelling
- Ensure the table exists in your Supabase project

**Connection issues**
- Verify your Supabase project is active
- Check network connectivity
- Ensure your API key has the necessary permissions

## Next Steps

1. Configure your StoryNet database schema in Supabase
2. Start the MCP server in development mode
3. Use Copilot to interact with your data

For detailed MCP documentation, see: https://modelcontextprotocol.io/

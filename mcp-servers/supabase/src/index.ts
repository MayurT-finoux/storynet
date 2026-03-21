import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  TextContent
} from '@modelcontextprotocol/sdk/types.js'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_API_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_API_KEY environment variables')
  process.exit(1)
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)

// Create server instance
const server = new Server({
  name: 'supabase-mcp-server',
  version: '1.0.0'
})

// Define available tools
const TOOLS = [
  {
    name: 'query_table',
    description: 'Query data from a Supabase table with optional filters',
    inputSchema: {
      type: 'object' as const,
      properties: {
        table: {
          type: 'string',
          description: 'Table name (e.g., "stories", "characters", "pages", "connections")'
        },
        select: {
          type: 'string',
          description: 'Columns to select (default: "*")'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of rows to return'
        },
        filter: {
          type: 'string',
          description: 'Filter condition (e.g., "id.eq.123" or "name.ilike.%story%")'
        }
      },
      required: ['table']
    }
  },
  {
    name: 'insert_record',
    description: 'Insert a new record into a Supabase table',
    inputSchema: {
      type: 'object' as const,
      properties: {
        table: {
          type: 'string',
          description: 'Table name'
        },
        data: {
          type: 'object',
          description: 'Data to insert'
        }
      },
      required: ['table', 'data']
    }
  },
  {
    name: 'update_record',
    description: 'Update a record in a Supabase table',
    inputSchema: {
      type: 'object' as const,
      properties: {
        table: {
          type: 'string',
          description: 'Table name'
        },
        id: {
          type: 'string',
          description: 'Record ID to update'
        },
        data: {
          type: 'object',
          description: 'Data to update'
        }
      },
      required: ['table', 'id', 'data']
    }
  },
  {
    name: 'delete_record',
    description: 'Delete a record from a Supabase table',
    inputSchema: {
      type: 'object' as const,
      properties: {
        table: {
          type: 'string',
          description: 'Table name'
        },
        id: {
          type: 'string',
          description: 'Record ID to delete'
        }
      },
      required: ['table', 'id']
    }
  },
  {
    name: 'call_rpc',
    description: 'Call a Supabase PostgreSQL function (RPC)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        function_name: {
          type: 'string',
          description: 'Name of the PostgreSQL function to call'
        },
        args: {
          type: 'object',
          description: 'Arguments to pass to the function'
        }
      },
      required: ['function_name']
    }
  }
]

// Register handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params

  try {
    switch (name) {
      case 'query_table': {
        let query = supabase.from(args.table as string).select(args.select as string || '*')
        
        if (args.limit) {
          query = query.limit(args.limit as number)
        }
        
        if (args.filter) {
          // Parse filter string (e.g., "id.eq.123")
          const [column, op, value] = (args.filter as string).split('.')
          query = query.filter(column, op, value)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2)
            }
          ]
        }
      }

      case 'insert_record': {
        const { data, error } = await supabase
          .from(args.table as string)
          .insert([args.data])
          .select()
        
        if (error) throw error
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2)
            }
          ]
        }
      }

      case 'update_record': {
        const { data, error } = await supabase
          .from(args.table as string)
          .update(args.data)
          .eq('id', args.id as string)
          .select()
        
        if (error) throw error
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2)
            }
          ]
        }
      }

      case 'delete_record': {
        const { error } = await supabase
          .from(args.table as string)
          .delete()
          .eq('id', args.id as string)
        
        if (error) throw error
        
        return {
          content: [
            {
              type: 'text',
              text: `Successfully deleted record with id: ${args.id}`
            }
          ]
        }
      }

      case 'call_rpc': {
        const { data, error } = await supabase.rpc(args.function_name as string, args.args)
        
        if (error) throw error
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2)
            }
          ]
        }
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`
            }
          ],
          isError: true
        }
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    }
  }
})

// Start server
const transport = new StdioServerTransport()
await server.connect(transport)
console.error('Supabase MCP Server running on stdio')

#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from './logger.js';
import {
  CallToolRequestSchema,
  CallToolResult,
  ErrorCode,
  Tool,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Import tools
import {
  getTokensTool,
  getTokenTool,
  searchTokensTool,
  getTokens,
  getToken,
  searchTokens,
  getTokensSchema,
  getTokenSchema,
  searchTokensSchema,
} from './tools/tokens.tool.js';

import {
  getComponentsTool,
  getComponentTool,
  getComponentCodeTool,
  searchComponentsTool,
  getComponents,
  getComponent,
  getComponentCode,
  searchComponents,
  getComponentsSchema,
  getComponentSchema,
  getComponentCodeSchema,
  searchComponentsSchema,
} from './tools/components.tool.js';

import {
  getPatternsTool,
  getPatternTool,
  getPatternsByComponentTool,
  getPatterns,
  getPattern,
  getPatternsByComponent,
  getPatternsSchema,
  getPatternSchema,
  getPatternsByComponentSchema,
} from './tools/patterns.tool.js';

import {
  getComplianceRulesTool,
  scanComponentTool,
  exportRulesTool,
  getComplianceRules,
  scanComponent,
  exportRules,
  getComplianceRulesSchema,
  scanComponentSchema,
  exportRulesSchema,
} from './tools/compliance.tool.js';

import {
  getAssetsTool,
  getIconsTool,
  getAssetByIdTool,
  searchAssetsTool,
  getAssetTypesTool,
  getAssets,
  getIcons,
  getAssetById,
  searchAssets,
  getAssetTypes,
  getAssetsSchema,
  getIconsSchema,
  getAssetByIdSchema,
  searchAssetsSchema,
  getAssetTypesSchema,
} from './tools/assets.tool.js';

import {
  getReviewsTool,
  getReviewTool,
  createReviewTool,
  updateReviewTool,
  searchReviewsTool,
  getReviewCommentsTool,
  addReviewCommentTool,
  getReviews,
  getReview,
  createReview,
  updateReview,
  searchReviews,
  getReviewComments,
  addReviewComment,
  getReviewsSchema,
  getReviewSchema,
  createReviewSchema,
  updateReviewSchema,
  searchReviewsSchema,
  getReviewCommentsSchema,
  addReviewCommentSchema,
} from './tools/reviews.tool.js';

// Import resources
import {
  listDocumentationResources,
  readDocumentationResource,
} from './resources/documentation.resource.js';

import {
  listDesignSystemResources,
  readDesignSystemResource,
} from './resources/design-system.resource.js';

/**
 * Every tool this server exposes, in the order they are listed to clients.
 */
export const TOOLS: Tool[] = [
  // Tokens tools
  getTokensTool,
  getTokenTool,
  searchTokensTool,
  // Components tools
  getComponentsTool,
  getComponentTool,
  getComponentCodeTool,
  searchComponentsTool,
  // Patterns tools
  getPatternsTool,
  getPatternTool,
  getPatternsByComponentTool,
  // Compliance tools
  getComplianceRulesTool,
  scanComponentTool,
  exportRulesTool,
  // Assets tools
  getAssetsTool,
  getIconsTool,
  getAssetByIdTool,
  searchAssetsTool,
  getAssetTypesTool,
  // Reviews tools
  getReviewsTool,
  getReviewTool,
  createReviewTool,
  updateReviewTool,
  searchReviewsTool,
  getReviewCommentsTool,
  addReviewCommentTool,
];

/**
 * Validate a tool's arguments against its zod schema. Invalid input becomes an
 * McpError(InvalidParams) that `callTool` turns into an `isError` tool result,
 * so a bad call never surfaces as an unhandled exception.
 */
function parseArgs<S extends z.ZodTypeAny>(schema: S, tool: string, args: unknown): z.infer<S> {
  const result = schema.safeParse(args);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.length > 0 ? issue.path.join('.') : '(root)'}: ${issue.message}`)
      .join('; ');
    throw new McpError(ErrorCode.InvalidParams, `Invalid arguments for tool ${tool}: ${issues}`);
  }
  return result.data;
}

function jsonResult(value: unknown): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

function textResult(text: string): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text,
      },
    ],
  };
}

/**
 * Remove secrets from tool arguments before they are logged.
 */
function redactArgs(args: Record<string, unknown>): Record<string, unknown> {
  return 'password' in args ? { ...args, password: '[redacted]' } : args;
}

/**
 * Run a tool by name. Missing arguments are treated as `{}`; arguments are
 * validated against the tool's schema; every failure (invalid input, unknown
 * tool, API error) is returned as an `isError` result rather than thrown.
 */
export async function callTool(name: string, rawArgs?: Record<string, unknown>): Promise<CallToolResult> {
  const args = rawArgs ?? {};

  try {
    switch (name) {
      // Tokens
      case 'get_tokens':
        return jsonResult(await getTokens(parseArgs(getTokensSchema, name, args)));
      case 'get_token':
        return jsonResult(await getToken(parseArgs(getTokenSchema, name, args)));
      case 'search_tokens':
        return jsonResult(await searchTokens(parseArgs(searchTokensSchema, name, args)));

      // Components
      case 'get_components':
        return jsonResult(await getComponents(parseArgs(getComponentsSchema, name, args)));
      case 'get_component':
        return jsonResult(await getComponent(parseArgs(getComponentSchema, name, args)));
      case 'get_component_code':
        return textResult(await getComponentCode(parseArgs(getComponentCodeSchema, name, args)));
      case 'search_components':
        return jsonResult(await searchComponents(parseArgs(searchComponentsSchema, name, args)));

      // Patterns
      case 'get_patterns':
        return jsonResult(await getPatterns(parseArgs(getPatternsSchema, name, args)));
      case 'get_pattern':
        return jsonResult(await getPattern(parseArgs(getPatternSchema, name, args)));
      case 'get_patterns_by_component':
        return jsonResult(await getPatternsByComponent(parseArgs(getPatternsByComponentSchema, name, args)));

      // Compliance
      case 'get_compliance_rules':
        parseArgs(getComplianceRulesSchema, name, args);
        return jsonResult(await getComplianceRules());
      case 'scan_component':
        return jsonResult(await scanComponent(parseArgs(scanComponentSchema, name, args)));
      case 'export_rules':
        return textResult(await exportRules(parseArgs(exportRulesSchema, name, args)));

      // Assets
      case 'get_assets':
        return jsonResult(await getAssets(parseArgs(getAssetsSchema, name, args)));
      case 'get_icons':
        return jsonResult(await getIcons(parseArgs(getIconsSchema, name, args)));
      case 'get_asset_by_id':
        return jsonResult(await getAssetById(parseArgs(getAssetByIdSchema, name, args)));
      case 'search_assets':
        return jsonResult(await searchAssets(parseArgs(searchAssetsSchema, name, args)));
      case 'get_asset_types':
        parseArgs(getAssetTypesSchema, name, args);
        return jsonResult(await getAssetTypes());

      // Reviews
      case 'get_reviews':
        return jsonResult(await getReviews(parseArgs(getReviewsSchema, name, args)));
      case 'get_review':
        return jsonResult(await getReview(parseArgs(getReviewSchema, name, args)));
      case 'create_review':
        return jsonResult(await createReview(parseArgs(createReviewSchema, name, args)));
      case 'update_review':
        return jsonResult(await updateReview(parseArgs(updateReviewSchema, name, args)));
      case 'search_reviews':
        return jsonResult(await searchReviews(parseArgs(searchReviewsSchema, name, args)));
      case 'get_review_comments':
        return jsonResult(await getReviewComments(parseArgs(getReviewCommentsSchema, name, args)));
      case 'add_review_comment':
        return jsonResult(await addReviewComment(parseArgs(addReviewCommentSchema, name, args)));

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Tool execution failed', {
      tool: name,
      error: errorMessage,
      args: redactArgs(args),
    });
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

export class DesignSystemMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'design-system-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: TOOLS,
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return await callTool(name, args);
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const docsResources = listDocumentationResources();
      const dsResources = listDesignSystemResources();
      
      return {
        resources: [...docsResources, ...dsResources],
      };
    });

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        let content: string;
        let mimeType: string;

        if (uri.startsWith('design-system://docs/')) {
          content = await readDocumentationResource(uri);
          mimeType = 'text/markdown';
        } else if (uri.startsWith('design-system://')) {
          content = await readDesignSystemResource(uri);
          mimeType = 'application/json';
        } else {
          throw new Error(`Unknown resource URI: ${uri}`);
        }

        return {
          contents: [
            {
              uri,
              mimeType,
              text: content,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Resource read failed', {
          uri,
          error: errorMessage,
        });
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: `Error: ${errorMessage}`,
            },
          ],
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('Design System MCP Server running on stdio', {
      service: 'mcp-server',
      transport: 'stdio',
    });
  }
}

// Start the server when run directly (not when imported, e.g. by tests)
if (require.main === module) {
  const server = new DesignSystemMCPServer();
  server.run().catch((error) => {
    logger.error('Fatal error starting server', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  });
}


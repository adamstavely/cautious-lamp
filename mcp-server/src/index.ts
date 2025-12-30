#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from './logger.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import tools
import {
  getTokensTool,
  getTokenTool,
  searchTokensTool,
  getTokens,
  getToken,
  searchTokens,
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
} from './tools/components.tool.js';

import {
  getPatternsTool,
  getPatternTool,
  getPatternsByComponentTool,
  getPatterns,
  getPattern,
  getPatternsByComponent,
} from './tools/patterns.tool.js';

import {
  getComplianceRulesTool,
  scanComponentTool,
  exportRulesTool,
  getComplianceRules,
  scanComponent,
  exportRules,
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
} from './tools/assets.tool.js';

import {
  getReviewsTool,
  getReviewTool,
  createReviewTool,
  updateReviewTool,
  searchReviewsTool,
  getReviews,
  getReview,
  createReview,
  updateReview,
  searchReviews,
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

class DesignSystemMCPServer {
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
        tools: [
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
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Tokens
          case 'get_tokens':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await getTokens(args as any), null, 2),
                },
              ],
            };
          case 'get_token':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await getToken(args as any), null, 2),
                },
              ],
            };
          case 'search_tokens':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await searchTokens(args as any), null, 2),
                },
              ],
            };

          // Components
          case 'get_components':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await getComponents(args as any), null, 2),
                },
              ],
            };
          case 'get_component':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await getComponent(args as any), null, 2),
                },
              ],
            };
          case 'get_component_code':
            return {
              content: [
                {
                  type: 'text',
                  text: await getComponentCode(args as any),
                },
              ],
            };
          case 'search_components':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await searchComponents(args as any), null, 2),
                },
              ],
            };

          // Patterns
          case 'get_patterns':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await getPatterns(args as any), null, 2),
                },
              ],
            };
          case 'get_pattern':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await getPattern(args as any), null, 2),
                },
              ],
            };
          case 'get_patterns_by_component':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await getPatternsByComponent(args as any), null, 2),
                },
              ],
            };

          // Compliance
          case 'get_compliance_rules':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await getComplianceRules(), null, 2),
                },
              ],
            };
          case 'scan_component':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await scanComponent(args as any), null, 2),
                },
              ],
            };
          case 'export_rules':
            return {
              content: [
                {
                  type: 'text',
                  text: await exportRules(args as any),
                },
              ],
            };

          // Assets
          case 'get_assets':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await getAssets(args as any), null, 2),
                },
              ],
            };
          case 'get_icons':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await getIcons(args as any), null, 2),
                },
              ],
            };
          case 'get_asset_by_id':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await getAssetById(args as any), null, 2),
                },
              ],
            };
          case 'search_assets':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await searchAssets(args as any), null, 2),
                },
              ],
            };
          case 'get_asset_types':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await getAssetTypes(), null, 2),
                },
              ],
            };

          // Reviews
          case 'get_reviews':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await getReviews(args as any), null, 2),
                },
              ],
            };
          case 'get_review':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await getReview(args as any), null, 2),
                },
              ],
            };
          case 'create_review':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await createReview(args as any), null, 2),
                },
              ],
            };
          case 'update_review':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await updateReview(args as any), null, 2),
                },
              ],
            };
          case 'search_reviews':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await searchReviews(args as any), null, 2),
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Tool execution failed', {
          tool: name,
          error: errorMessage,
          args,
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

// Start the server
const server = new DesignSystemMCPServer();
server.run().catch((error) => {
  logger.error('Fatal error starting server', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(1);
});


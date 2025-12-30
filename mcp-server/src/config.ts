import { z } from 'zod';

const ConfigSchema = z.object({
  apiBaseUrl: z.string().url().default('http://localhost:3000/api/v1'),
  apiKey: z.string().min(1, 'API key is required'),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const apiBaseUrl = process.env.MCP_API_BASE_URL || 'http://localhost:3000/api/v1';
  const apiKey = process.env.MCP_API_KEY || '';

  try {
    return ConfigSchema.parse({
      apiBaseUrl,
      apiKey,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Configuration error: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    throw error;
  }
}

export const config = loadConfig();



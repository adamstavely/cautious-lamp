import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from './config';
import { logger } from './logger';
import { cache } from './cache';

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryableStatusCodes?: number[];
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: AxiosError, retryableStatusCodes: number[]): boolean {
  if (!error.response) {
    // Network errors or timeouts are retryable
    return true;
  }
  
  const status = error.response.status;
  return retryableStatusCodes.includes(status);
}

async function retryRequest<T>(
  requestFn: () => Promise<T>,
  retryConfig: Required<RetryConfig>,
  context?: string
): Promise<T> {
  let lastError: Error | AxiosError | null = null;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on the last attempt
      if (attempt === retryConfig.maxRetries) {
        logger.error('Request failed after all retries', {
          context: context || 'api-client',
          attempt: attempt + 1,
          maxRetries: retryConfig.maxRetries,
          error: lastError.message,
        });
        break;
      }
      
      // Check if error is retryable
      // Check if it's an AxiosError or has response/request properties from interceptor
      const isRetryable = 
        (error instanceof AxiosError && isRetryableError(error, retryConfig.retryableStatusCodes)) ||
        ((error as any).response && retryConfig.retryableStatusCodes.includes((error as any).response.status)) ||
        ((error as any).request && !(error as any).response) || // Network error
        (error instanceof Error && error.message.includes('No response from server'));
      
      if (isRetryable) {
        // Calculate exponential backoff delay: delay * 2^attempt
        const delay = retryConfig.retryDelay * Math.pow(2, attempt);
        logger.warn('Retrying request after error', {
          context: context || 'api-client',
          attempt: attempt + 1,
          maxRetries: retryConfig.maxRetries,
          delay,
          error: lastError.message,
        });
        await sleep(delay);
        continue;
      }
      
      // Non-retryable error, throw immediately
      logger.error('Non-retryable error encountered', {
        context: context || 'api-client',
        error: lastError.message,
      });
      throw error;
    }
  }
  
  // All retries exhausted
  throw lastError || new Error('Request failed after retries');
}

export class ApiClient {
  private client: AxiosInstance;
  private retryConfig: Required<RetryConfig>;

  constructor(retryConfig?: RetryConfig) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (request) => {
        logger.debug('API request', {
          method: request.method,
          url: request.url,
          baseURL: request.baseURL,
        });
        return request;
      },
      (error) => {
        logger.error('API request setup failed', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    // Note: We preserve the AxiosError for retry logic, but transform it for final error messages
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('API response', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error: AxiosError) => {
        // Preserve the original AxiosError for retry logic
        // The retry logic will check the error and transform it if needed
        if (error.response) {
          // Server responded with error status
          logger.error('API error response', {
            status: error.response.status,
            statusText: error.response.statusText,
            url: error.config?.url,
            data: error.response.data,
          });
          // Create a new error but preserve the original for retry checks
          const newError = new Error(
            `API Error ${error.response.status}: ${error.response.statusText} - ${JSON.stringify(error.response.data)}`
          ) as any;
          newError.response = error.response;
          newError.isAxiosError = true;
          throw newError;
        } else if (error.request) {
          // Request made but no response received
          logger.error('API request timeout', {
            url: error.config?.url,
            baseURL: config.apiBaseUrl,
          });
          const newError = new Error(`API Request failed: No response from server at ${config.apiBaseUrl}`) as any;
          newError.request = error.request;
          newError.isAxiosError = true;
          throw newError;
        } else {
          // Error setting up request
          logger.error('API request setup failed', { error: error.message });
          throw new Error(`API Request setup failed: ${error.message}`);
        }
      }
    );
  }

  async get<T>(path: string, params?: Record<string, any>, resourceType?: string): Promise<T> {
    // Try to get from cache first
    if (resourceType) {
      const cached = cache.get<T>(resourceType, params);
      if (cached !== undefined) {
        return cached;
      }
    }

    // If not in cache, make request
    const result = await retryRequest(
      async () => {
        try {
          const response = await this.client.get<T>(path, { params });
          return response.data;
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          throw new Error(`Unexpected error: ${String(error)}`);
        }
      },
      this.retryConfig,
      `GET ${path}`
    );

    // Cache the result
    if (resourceType) {
      cache.set(resourceType, result, params);
    }

    return result;
  }

  async post<T>(path: string, data?: any, invalidateCache?: string): Promise<T> {
    const result = await retryRequest(
      async () => {
        try {
          const response = await this.client.post<T>(path, data);
          return response.data;
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          throw new Error(`Unexpected error: ${String(error)}`);
        }
      },
      this.retryConfig,
      `POST ${path}`
    );

    // Invalidate cache if specified
    if (invalidateCache) {
      cache.clearResourceType(invalidateCache);
    }

    return result;
  }

  async put<T>(path: string, data?: any, invalidateCache?: string): Promise<T> {
    const result = await retryRequest(
      async () => {
        try {
          const response = await this.client.put<T>(path, data);
          return response.data;
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          throw new Error(`Unexpected error: ${String(error)}`);
        }
      },
      this.retryConfig,
      `PUT ${path}`
    );

    // Invalidate cache if specified
    if (invalidateCache) {
      cache.clearResourceType(invalidateCache);
    }

    return result;
  }

  async delete<T>(path: string, invalidateCache?: string): Promise<T> {
    const result = await retryRequest(
      async () => {
        try {
          const response = await this.client.delete<T>(path);
          return response.data;
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          throw new Error(`Unexpected error: ${String(error)}`);
        }
      },
      this.retryConfig,
      `DELETE ${path}`
    );

    // Invalidate cache if specified
    if (invalidateCache) {
      cache.clearResourceType(invalidateCache);
    }

    return result;
  }
}

export const apiClient = new ApiClient();


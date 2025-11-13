import { Injectable, Logger } from '@nestjs/common';
import { ConnectionStatus } from '../types/common.types';

/**
 * Service to track connection status of external services
 */
@Injectable()
export class ConnectionStatusService {
  private readonly logger = new Logger(ConnectionStatusService.name);
  private readonly connections = new Map<string, ConnectionStatus>();
  private readonly checkIntervals = new Map<string, NodeJS.Timeout>();

  /**
   * Register a connection to monitor
   */
  registerConnection(
    serviceName: string,
    checkFunction: () => Promise<boolean>,
    intervalMs: number = 60000, // Default 1 minute
  ): void {
    this.logger.log(`Registering connection monitor for ${serviceName}`);
    
    // Initial check
    this.checkConnection(serviceName, checkFunction);

    // Set up periodic checks
    const interval = setInterval(() => {
      this.checkConnection(serviceName, checkFunction);
    }, intervalMs);

    this.checkIntervals.set(serviceName, interval);
  }

  /**
   * Check connection status
   */
  private async checkConnection(serviceName: string, checkFunction: () => Promise<boolean>): Promise<void> {
    const startTime = Date.now();
    
    try {
      const connected = await Promise.race([
        checkFunction(),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Connection check timeout')), 5000)
        ),
      ]) as boolean;

      const latency = Date.now() - startTime;
      
      this.connections.set(serviceName, {
        connected,
        lastChecked: new Date(),
        latency,
      });

      if (!connected) {
        this.logger.warn(`Connection check failed for ${serviceName}`);
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.connections.set(serviceName, {
        connected: false,
        lastChecked: new Date(),
        latency,
        error: errorMessage,
      });

      this.logger.error(`Connection check error for ${serviceName}: ${errorMessage}`);
    }
  }

  /**
   * Get connection status
   */
  getStatus(serviceName: string): ConnectionStatus | undefined {
    return this.connections.get(serviceName);
  }

  /**
   * Get all connection statuses
   */
  getAllStatuses(): Map<string, ConnectionStatus> {
    return new Map(this.connections);
  }

  /**
   * Check if a service is connected
   */
  isConnected(serviceName: string): boolean {
    const status = this.connections.get(serviceName);
    return status?.connected ?? false;
  }

  /**
   * Manually trigger a connection check
   */
  async checkConnectionNow(serviceName: string, checkFunction: () => Promise<boolean>): Promise<ConnectionStatus> {
    await this.checkConnection(serviceName, checkFunction);
    return this.connections.get(serviceName)!;
  }

  /**
   * Unregister a connection monitor
   */
  unregisterConnection(serviceName: string): void {
    const interval = this.checkIntervals.get(serviceName);
    if (interval) {
      clearInterval(interval);
      this.checkIntervals.delete(serviceName);
    }
    this.connections.delete(serviceName);
    this.logger.log(`Unregistered connection monitor for ${serviceName}`);
  }

  /**
   * Cleanup all monitors
   */
  onModuleDestroy(): void {
    this.checkIntervals.forEach((interval) => clearInterval(interval));
    this.checkIntervals.clear();
    this.connections.clear();
  }
}


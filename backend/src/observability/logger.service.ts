import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { Logger } from '@opentelemetry/api-logs';
import { LoggerProvider } from '@opentelemetry/sdk-logs';

/**
 * OpenTelemetry-aware logger service
 * Integrates with OpenTelemetry logging for structured logging
 */
@Injectable()
export class ObservabilityLogger implements NestLoggerService {
  private otelLogger: Logger;
  private context?: string;

  constructor(context?: string) {
    this.context = context;
    // Get logger from global logger provider
    const loggerProvider = new LoggerProvider();
    this.otelLogger = loggerProvider.getLogger('design-system-backend', context || '1.0.0');
  }

  log(message: any, context?: string): void {
    const ctx = context || this.context || 'Application';
    this.otelLogger.emit({
      severityNumber: 9, // INFO
      severityText: 'INFO',
      body: typeof message === 'string' ? message : JSON.stringify(message),
      attributes: {
        context: ctx,
        timestamp: new Date().toISOString(),
      },
    });
    console.log(`[${ctx}]`, message);
  }

  error(message: any, trace?: string, context?: string): void {
    const ctx = context || this.context || 'Application';
    this.otelLogger.emit({
      severityNumber: 17, // ERROR
      severityText: 'ERROR',
      body: typeof message === 'string' ? message : JSON.stringify(message),
      attributes: {
        context: ctx,
        trace,
        timestamp: new Date().toISOString(),
      },
    });
    console.error(`[${ctx}]`, message, trace ? `\n${trace}` : '');
  }

  warn(message: any, context?: string): void {
    const ctx = context || this.context || 'Application';
    this.otelLogger.emit({
      severityNumber: 13, // WARN
      severityText: 'WARN',
      body: typeof message === 'string' ? message : JSON.stringify(message),
      attributes: {
        context: ctx,
        timestamp: new Date().toISOString(),
      },
    });
    console.warn(`[${ctx}]`, message);
  }

  debug(message: any, context?: string): void {
    const ctx = context || this.context || 'Application';
    this.otelLogger.emit({
      severityNumber: 5, // DEBUG
      severityText: 'DEBUG',
      body: typeof message === 'string' ? message : JSON.stringify(message),
      attributes: {
        context: ctx,
        timestamp: new Date().toISOString(),
      },
    });
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${ctx}]`, message);
    }
  }

  verbose(message: any, context?: string): void {
    const ctx = context || this.context || 'Application';
    this.otelLogger.emit({
      severityNumber: 1, // TRACE
      severityText: 'TRACE',
      body: typeof message === 'string' ? message : JSON.stringify(message),
      attributes: {
        context: ctx,
        timestamp: new Date().toISOString(),
      },
    });
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${ctx}] [VERBOSE]`, message);
    }
  }
}


import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { PushMetricExporter, ResourceMetrics, MetricData } from '@opentelemetry/sdk-metrics';
import { LogRecordExporter } from '@opentelemetry/sdk-logs';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { Client } from '@elastic/elasticsearch';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

interface ElasticsearchExporterOptions {
  node: string;
  indexPrefix?: string;
  batchSize?: number;
  flushInterval?: number;
}

/**
 * Base class for Elasticsearch exporters with batching
 */
abstract class BaseElasticsearchExporter {
  protected client: Client;
  protected indexPrefix: string;
  protected batchSize: number;
  protected flushInterval: number;
  protected batch: any[] = [];
  protected flushTimer?: NodeJS.Timeout;

  constructor(options: ElasticsearchExporterOptions) {
    this.client = new Client({
      node: options.node,
      maxRetries: 3,
      requestTimeout: 30000,
    });
    this.indexPrefix = options.indexPrefix || 'otel';
    this.batchSize = options.batchSize || 100;
    this.flushInterval = options.flushInterval || 5000;

    this.startFlushTimer();
  }

  protected startFlushTimer() {
    this.flushTimer = setInterval(() => {
      if (this.batch.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  protected abstract getIndexName(): string;
  protected abstract transformData(data: any): any[];

  protected async flush(): Promise<void> {
    if (this.batch.length === 0) {
      return;
    }

    const documents = [...this.batch];
    this.batch = [];

    try {
      const index = this.getIndexName();
      const body = documents.flatMap((doc) => [{ index: { _index: index } }, doc]);

      await this.client.bulk({ body, refresh: false });
    } catch (error) {
      console.error(`Error flushing batch to Elasticsearch (${this.getIndexName()}):`, error);
      // Re-add documents to batch for retry
      this.batch.unshift(...documents);
    }
  }

  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    // Flush remaining data
    await this.flush();
    return this.client.close();
  }
}

/**
 * Elasticsearch exporter for traces
 */
export class ElasticsearchTraceExporter extends BaseElasticsearchExporter implements SpanExporter {
  protected getIndexName(): string {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    return `${this.indexPrefix}-trace-${date}`;
  }

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    try {
      const documents = spans.map((span) => this.transformSpan(span));
      this.batch.push(...documents);

      if (this.batch.length >= this.batchSize) {
        this.flush();
      }

      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      console.error('Error exporting spans:', error);
      resultCallback({
        code: ExportResultCode.FAILED,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  protected transformData(data: ReadableSpan[]): any[] {
    return data.map((span) => this.transformSpan(span));
  }

  private transformSpan(span: ReadableSpan): any {
    const resource = span.resource;
    const serviceName = resource.attributes[SemanticResourceAttributes.SERVICE_NAME] || 'unknown';
    const serviceVersion = resource.attributes[SemanticResourceAttributes.SERVICE_VERSION] || 'unknown';

    return {
      '@timestamp': new Date(span.startTime[0] * 1000 + span.startTime[1] / 1000000).toISOString(),
      traceId: span.spanContext().traceId,
      spanId: span.spanContext().spanId,
      parentSpanId: (span as any).parentSpanId || undefined,
      name: span.name,
      kind: span.kind,
      status: {
        code: span.status.code,
        message: span.status.message,
      },
      startTime: span.startTime,
      endTime: span.endTime,
      duration: span.duration[0] * 1000 + span.duration[1] / 1000000, // Convert to milliseconds
      attributes: span.attributes,
      events: span.events.map((event) => ({
        name: event.name,
        time: event.time,
        attributes: event.attributes,
      })),
      links: span.links.map((link) => ({
        traceId: link.context.traceId,
        spanId: link.context.spanId,
        attributes: link.attributes,
      })),
      resource: {
        service: {
          name: serviceName,
          version: serviceVersion,
        },
        attributes: resource.attributes,
      },
    };
  }
}

/**
 * Elasticsearch exporter for metrics
 */
export class ElasticsearchMetricExporter extends BaseElasticsearchExporter implements PushMetricExporter {
  async forceFlush(): Promise<void> {
    await this.flush();
  }
  protected getIndexName(): string {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    return `${this.indexPrefix}-metric-${date}`;
  }

  export(metrics: ResourceMetrics, resultCallback: (result: ExportResult) => void): void {
    try {
      const documents = this.transformMetrics(metrics);
      this.batch.push(...documents);

      if (this.batch.length >= this.batchSize) {
        this.flush();
      }

      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      console.error('Error exporting metrics:', error);
      resultCallback({
        code: ExportResultCode.FAILED,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  protected transformData(data: ResourceMetrics): any[] {
    return this.transformMetrics(data);
  }

  private transformMetrics(metrics: ResourceMetrics): any[] {
    const documents: any[] = [];
    const timestamp = new Date().toISOString();
    const serviceName =
      metrics.resource.attributes[SemanticResourceAttributes.SERVICE_NAME] || 'unknown';

    for (const scopeMetric of metrics.scopeMetrics || []) {
      for (const metric of scopeMetric.metrics || []) {
        const metricName = metric.descriptor.name;
        const description = metric.descriptor.description || '';
        const unit = metric.descriptor.unit || '';

        // Process different metric types
        const dataPointType = (metric as any).dataPointType;
        if (dataPointType === 0 || dataPointType === 'SUM') { // SUM = 0
          const sumMetric = metric as any;
          for (const dataPoint of sumMetric.dataPoints || []) {
            documents.push({
              '@timestamp': timestamp,
              metric: {
                name: metricName,
                description,
                unit,
                type: 'sum',
                value: dataPoint.asDouble !== undefined ? dataPoint.asDouble : dataPoint.asInt,
                attributes: dataPoint.attributes,
              },
              resource: {
                service: {
                  name: serviceName,
                },
                attributes: metrics.resource.attributes,
              },
            });
          }
        }

        if (dataPointType === 1 || dataPointType === 'GAUGE') { // GAUGE = 1
          const gaugeMetric = metric as any;
          for (const dataPoint of gaugeMetric.dataPoints || []) {
            documents.push({
              '@timestamp': timestamp,
              metric: {
                name: metricName,
                description,
                unit,
                type: 'gauge',
                value: dataPoint.asDouble !== undefined ? dataPoint.asDouble : dataPoint.asInt,
                attributes: dataPoint.attributes,
              },
              resource: {
                service: {
                  name: serviceName,
                },
                attributes: metrics.resource.attributes,
              },
            });
          }
        }

        if (dataPointType === 2 || dataPointType === 'HISTOGRAM') { // HISTOGRAM = 2
          const histogramMetric = metric as any;
          for (const dataPoint of histogramMetric.dataPoints || []) {
            documents.push({
              '@timestamp': timestamp,
              metric: {
                name: metricName,
                description,
                unit,
                type: 'histogram',
                count: dataPoint.count,
                sum: dataPoint.sum,
                min: dataPoint.min,
                max: dataPoint.max,
                buckets: dataPoint.bucketCounts,
                explicitBounds: dataPoint.explicitBounds,
                attributes: dataPoint.attributes,
              },
              resource: {
                service: {
                  name: serviceName,
                },
                attributes: metrics.resource.attributes,
              },
            });
          }
        }
      }
    }

    return documents;
  }
}

/**
 * Elasticsearch exporter for logs
 */
export class ElasticsearchLogExporter extends BaseElasticsearchExporter implements LogRecordExporter {
  protected getIndexName(): string {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    return `${this.indexPrefix}-log-${date}`;
  }

  export(logs: ReadableLogRecord[], resultCallback: (result: ExportResult) => void): void {
    try {
      const documents = logs.map((log) => this.transformLog(log));
      this.batch.push(...documents);

      if (this.batch.length >= this.batchSize) {
        this.flush();
      }

      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      console.error('Error exporting logs:', error);
      resultCallback({
        code: ExportResultCode.FAILED,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  protected transformData(data: ReadableLogRecord[]): any[] {
    return data.map((log) => this.transformLog(log));
  }

  private transformLog(log: ReadableLogRecord): any {
    const resource = log.resource;
    const serviceName = resource.attributes[SemanticResourceAttributes.SERVICE_NAME] || 'unknown';
    const serviceVersion = resource.attributes[SemanticResourceAttributes.SERVICE_VERSION] || 'unknown';

    return {
      '@timestamp': new Date(log.hrTime[0] * 1000 + log.hrTime[1] / 1000000).toISOString(),
      traceId: log.spanContext?.traceId,
      spanId: log.spanContext?.spanId,
      severity: {
        text: log.severityText,
        number: log.severityNumber,
      },
      body: log.body,
      attributes: log.attributes,
      resource: {
        service: {
          name: serviceName,
          version: serviceVersion,
        },
        attributes: resource.attributes,
      },
    };
  }
}

/**
 * Factory function to create appropriate exporter based on type
 */
export function createElasticsearchExporter(
  type: 'trace' | 'metric' | 'log',
  options: ElasticsearchExporterOptions,
) {
  switch (type) {
    case 'trace':
      return new ElasticsearchTraceExporter(options);
    case 'metric':
      return new ElasticsearchMetricExporter(options);
    case 'log':
      return new ElasticsearchLogExporter(options);
    default:
      throw new Error(`Unknown exporter type: ${type}`);
  }
}

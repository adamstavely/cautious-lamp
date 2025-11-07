import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { createElasticsearchExporter } from './elasticsearch-exporter';

// Initialize OpenTelemetry SDK
export async function initializeOpenTelemetry() {
  const serviceName = process.env.OTEL_SERVICE_NAME || 'design-system-backend';
  const serviceVersion = process.env.OTEL_SERVICE_VERSION || '1.0.0';
  const environment = process.env.NODE_ENV || 'development';

  // Determine export method
  const useDirectElasticsearch = process.env.OTEL_EXPORTER_ELASTICSEARCH === 'true';
  const elasticsearchNode = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

  // Create resource with service information
  // Use resourceFromAttributes as a workaround for TypeScript import issues
  const { resourceFromAttributes } = await import('@opentelemetry/resources');
  const resource = resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: environment,
    [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: `${serviceName}-${Date.now()}`,
  });

  // Configure trace exporter
  const traceExporter = useDirectElasticsearch
    ? (createElasticsearchExporter('trace', { node: elasticsearchNode }) as any)
    : new OTLPTraceExporter({
        url: `${otlpEndpoint}/v1/traces`,
      });

  // Configure metric exporter
  const metricExporter = useDirectElasticsearch
    ? (createElasticsearchExporter('metric', { node: elasticsearchNode }) as any)
    : new OTLPMetricExporter({
        url: `${otlpEndpoint}/v1/metrics`,
      });

  // Configure log exporter
  const logExporter = useDirectElasticsearch
    ? (createElasticsearchExporter('log', { node: elasticsearchNode }) as any)
    : new OTLPLogExporter({
        url: `${otlpEndpoint}/v1/logs`,
      });

  // Create SDK instance
  const sdk = new NodeSDK({
    resource,
    traceExporter,
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 10000, // Export every 10 seconds
    }),
    logRecordProcessor: new BatchLogRecordProcessor(logExporter),
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable fs instrumentation to reduce noise
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        // Enable HTTP instrumentation
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          ignoreIncomingRequestHook: (req) => {
            // Ignore health check endpoints
            return req.url?.includes('/health') || false;
          },
        },
        // Enable Express instrumentation
        '@opentelemetry/instrumentation-express': {
          enabled: true,
        },
      }),
    ],
  });

  // Start the SDK
  sdk.start();

  console.log(`OpenTelemetry initialized for service: ${serviceName} (${serviceVersion})`);
  console.log(`Export method: ${useDirectElasticsearch ? 'Direct Elasticsearch' : 'OTLP'}`);
  console.log(`Environment: ${environment}`);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('OpenTelemetry terminated'))
      .catch((error) => console.error('Error terminating OpenTelemetry', error));
  });

  return sdk;
}


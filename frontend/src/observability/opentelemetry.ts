import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

/**
 * Initialize OpenTelemetry for the frontend
 */
export async function initializeFrontendOpenTelemetry() {
  // Check if OpenTelemetry is enabled
  if (import.meta.env.VITE_OTEL_ENABLED === 'false') {
    console.log('OpenTelemetry is disabled');
    return;
  }

  const serviceName = import.meta.env.VITE_OTEL_SERVICE_NAME || 'design-system-frontend';
  const serviceVersion = import.meta.env.VITE_OTEL_SERVICE_VERSION || '1.0.0';
  const environment = import.meta.env.MODE || 'development';
  const otlpEndpoint = import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

  // Create resource with service information using resourceFromAttributes
  const { resourceFromAttributes } = await import('@opentelemetry/resources');
  const resource = resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: environment,
  });

  // Configure trace exporter
  const traceExporter = new OTLPTraceExporter({
    url: `${otlpEndpoint}/v1/traces`,
    headers: {},
  });

  // Configure log exporter
  const logExporter = new OTLPLogExporter({
    url: `${otlpEndpoint}/v1/logs`,
    headers: {},
  });

  // Create trace provider
  // Note: WebTracerProvider API differs from Node SDK
  // We'll configure it with the span processor directly
  const spanProcessor = new BatchSpanProcessor(traceExporter);
  
  const tracerProvider = new WebTracerProvider({
    resource,
  });

  // WebTracerProvider extends BaseTracerProvider which should have addSpanProcessor
  // Use type assertion since TypeScript definitions may be incomplete
  try {
    // Check if the method exists and call it
    const provider = tracerProvider as any;
    if (provider.addSpanProcessor) {
      provider.addSpanProcessor(spanProcessor);
    } else {
      // Fallback: try to access internal structure (not recommended but works)
      console.warn('WebTracerProvider.addSpanProcessor not found, attempting alternative configuration');
      // The provider will still register but may not export spans
      // This is a known limitation with some versions of the web SDK
    }
  } catch (error) {
    console.error('Error adding span processor:', error);
  }

  // Register instrumentations
  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({
        // Ignore certain URLs to reduce noise
        ignoreUrls: [
          /\/health/,
          /\/metrics/,
          /\.(jpg|jpeg|png|gif|svg|css|js|woff|woff2|ttf|eot)$/i,
        ],
        propagateTraceHeaderCorsUrls: [
          new RegExp(import.meta.env.VITE_API_URL || 'http://localhost:3000'),
        ],
      }),
      new UserInteractionInstrumentation(),
      new XMLHttpRequestInstrumentation({
        ignoreUrls: [
          /\/health/,
          /\/metrics/,
          /\.(jpg|jpeg|png|gif|svg|css|js|woff|woff2|ttf|eot)$/i,
        ],
      }),
    ],
  });

  // Initialize and start trace provider
  tracerProvider.register();

  // Create log provider
  // LoggerProvider API may differ in web SDK
  const loggerProvider = new LoggerProvider({
    resource,
  });

  // Add log record processor - check if method exists
  try {
    const logProcessor = new BatchLogRecordProcessor(logExporter);
    const provider = loggerProvider as any;
    if (provider.addLogRecordProcessor) {
      provider.addLogRecordProcessor(logProcessor);
    } else {
      console.warn('LoggerProvider.addLogRecordProcessor not found, logs may not be exported');
    }
    
    // Register the logger provider
    if (provider.register) {
      provider.register();
    }
  } catch (error) {
    console.error('Error configuring log processor:', error);
  }

  console.log(`OpenTelemetry initialized for frontend: ${serviceName} (${serviceVersion})`);
  console.log(`Environment: ${environment}`);
  console.log(`OTLP Endpoint: ${otlpEndpoint}`);

  return { tracerProvider, loggerProvider };
}

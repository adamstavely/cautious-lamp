# OpenTelemetry Observability Setup

This document describes the OpenTelemetry (OTEL) implementation for MELT (Metrics, Events, Logs, Traces) observability to Elasticsearch.

## Overview

The design system uses OpenTelemetry standard for comprehensive observability:

- **Traces**: Distributed tracing across frontend and backend
- **Metrics**: Performance metrics, business metrics, and system metrics
- **Logs**: Structured logging with correlation to traces
- **Events**: Custom events for business logic tracking

## Architecture

### Backend (NestJS)

The backend uses OpenTelemetry Node.js SDK with:
- Automatic instrumentation for HTTP, Express, and NestJS
- Custom Elasticsearch exporter for direct export
- OTLP exporter option for use with OpenTelemetry Collector
- Structured logging via OpenTelemetry Logger API

### Frontend (Vue.js)

The frontend uses OpenTelemetry Web SDK with:
- Automatic instrumentation for document load, fetch, XHR, and user interactions
- OTLP exporter to backend or collector
- Trace context propagation to backend

## Configuration

### Environment Variables

#### Backend

```bash
# Enable/disable OpenTelemetry (default: enabled)
OTEL_ENABLED=true

# Service identification
OTEL_SERVICE_NAME=design-system-backend
OTEL_SERVICE_VERSION=1.0.0

# Export method: 'true' for direct Elasticsearch, 'false' for OTLP
OTEL_EXPORTER_ELASTICSEARCH=true

# Elasticsearch connection (if using direct export)
ELASTICSEARCH_NODE=http://localhost:9200

# OTLP endpoint (if using OTLP export)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

#### Frontend

```bash
# Enable/disable OpenTelemetry (default: enabled)
VITE_OTEL_ENABLED=true

# Service identification
VITE_OTEL_SERVICE_NAME=design-system-frontend
VITE_OTEL_SERVICE_VERSION=1.0.0

# OTLP endpoint
VITE_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

# API URL for trace context propagation
VITE_API_URL=http://localhost:3000
```

## Export Methods

### Method 1: Direct Elasticsearch Export

The backend can export directly to Elasticsearch using custom exporters. This is the simplest setup for development.

**Advantages:**
- No additional infrastructure needed
- Lower latency
- Simple configuration

**Disadvantages:**
- Less flexible
- No data transformation pipeline
- Limited to backend only

**Setup:**
```bash
OTEL_EXPORTER_ELASTICSEARCH=true
ELASTICSEARCH_NODE=http://localhost:9200
```

### Method 2: OpenTelemetry Collector (Recommended)

Use the OpenTelemetry Collector as an intermediary. This is recommended for production.

**Advantages:**
- Centralized data processing
- Data transformation and filtering
- Multiple export destinations
- Works for both frontend and backend

**Disadvantages:**
- Additional infrastructure component
- More complex setup

**Setup:**

1. Install OpenTelemetry Collector:
```bash
# Download from https://github.com/open-telemetry/opentelemetry-collector-releases
```

2. Configure collector (`otel-collector-config.yaml`):
```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024
  resource:
    attributes:
      - key: deployment.environment
        value: production
        action: upsert

exporters:
  elasticsearch:
    endpoints:
      - http://localhost:9200
    logs_index: otel-logs
    traces_index: otel-traces
    metrics_index: otel-metrics

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch, resource]
      exporters: [elasticsearch]
    metrics:
      receivers: [otlp]
      processors: [batch, resource]
      exporters: [elasticsearch]
    logs:
      receivers: [otlp]
      processors: [batch, resource]
      exporters: [elasticsearch]
```

3. Set environment variables:
```bash
OTEL_EXPORTER_ELASTICSEARCH=false
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

## Elasticsearch Index Structure

### Traces Index: `otel-trace-YYYY.MM.DD`

```json
{
  "@timestamp": "2024-01-01T12:00:00Z",
  "traceId": "abc123...",
  "spanId": "def456...",
  "parentSpanId": "ghi789...",
  "name": "GET /api/v1/components",
  "kind": "SERVER",
  "status": {
    "code": "OK",
    "message": ""
  },
  "duration": 123.45,
  "attributes": {
    "http.method": "GET",
    "http.url": "/api/v1/components",
    "http.status_code": 200
  },
  "resource": {
    "service": {
      "name": "design-system-backend",
      "version": "1.0.0"
    }
  }
}
```

### Metrics Index: `otel-metric-YYYY.MM.DD`

```json
{
  "@timestamp": "2024-01-01T12:00:00Z",
  "metric": {
    "name": "http.server.request.duration",
    "type": "histogram",
    "unit": "ms",
    "value": 123.45,
    "count": 100,
    "sum": 12345,
    "min": 10,
    "max": 500
  },
  "resource": {
    "service": {
      "name": "design-system-backend"
    }
  }
}
```

### Logs Index: `otel-log-YYYY.MM.DD`

```json
{
  "@timestamp": "2024-01-01T12:00:00Z",
  "traceId": "abc123...",
  "spanId": "def456...",
  "severity": {
    "text": "INFO",
    "number": 9
  },
  "body": "Component created successfully",
  "attributes": {
    "context": "DesignSystemService",
    "componentId": "button-123"
  },
  "resource": {
    "service": {
      "name": "design-system-backend",
      "version": "1.0.0"
    }
  }
}
```

## Usage

### Backend: Custom Spans

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('design-system-service');

async function createComponent(data: ComponentData) {
  const span = tracer.startSpan('create-component');
  
  try {
    span.setAttributes({
      'component.name': data.name,
      'component.type': data.type,
    });
    
    const component = await db.components.create(data);
    
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
    
    return component;
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
    span.recordException(error);
    span.end();
    throw error;
  }
}
```

### Backend: Structured Logging

```typescript
import { ObservabilityLogger } from './observability/logger.service';

const logger = new ObservabilityLogger('DesignSystemService');

logger.log('Component created', { componentId: 'button-123' });
logger.error('Failed to create component', error.stack, 'DesignSystemService');
```

### Frontend: Custom Spans

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('design-system-frontend');

function handleButtonClick() {
  const span = tracer.startSpan('button-click');
  
  span.setAttributes({
    'button.id': 'submit-button',
    'button.action': 'submit-form',
  });
  
  // Your code here
  
  span.end();
}
```

## Elasticsearch Dashboards

### Creating Index Templates

```bash
# Create index template for traces
curl -X PUT "localhost:9200/_index_template/otel-traces" -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["otel-trace-*"],
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "traceId": { "type": "keyword" },
        "spanId": { "type": "keyword" },
        "name": { "type": "text" },
        "duration": { "type": "float" },
        "attributes": { "type": "object" },
        "resource": { "type": "object" }
      }
    }
  }
}'
```

### Sample Queries

**Find slow requests:**
```json
{
  "query": {
    "range": {
      "duration": {
        "gte": 1000
      }
    }
  },
  "sort": [
    { "duration": "desc" }
  ]
}
```

**Trace a request:**
```json
{
  "query": {
    "term": {
      "traceId": "abc123..."
    }
  }
}
```

**Error logs:**
```json
{
  "query": {
    "term": {
      "severity.text": "ERROR"
    }
  }
}
```

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Request Rate**: Requests per second
2. **Error Rate**: Percentage of failed requests
3. **Latency**: P50, P95, P99 response times
4. **Trace Sampling**: Ensure adequate trace coverage

### Recommended Alerts

- Error rate > 5%
- P95 latency > 1 second
- Trace export failures
- Elasticsearch connection failures

## Troubleshooting

### Traces not appearing

1. Check OpenTelemetry is enabled: `OTEL_ENABLED=true`
2. Verify Elasticsearch connection
3. Check exporter configuration
4. Review console logs for errors

### High memory usage

1. Reduce batch size in exporters
2. Increase flush interval
3. Enable trace sampling

### Missing frontend traces

1. Verify CORS is configured correctly
2. Check trace context propagation headers
3. Verify OTLP endpoint is accessible

## Best Practices

1. **Use structured logging**: Always include context and attributes
2. **Set appropriate span attributes**: Include business context
3. **Sample traces in production**: Use sampling to reduce overhead
4. **Monitor exporter health**: Set up alerts for export failures
5. **Use index templates**: Pre-configure Elasticsearch indices
6. **Set retention policies**: Configure index lifecycle management
7. **Correlate logs with traces**: Use traceId in logs

## References

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)
- [Elasticsearch OpenTelemetry Integration](https://www.elastic.co/guide/en/observability/current/ingest-opentelemetry.html)


import 'dotenv/config';

// Initialize OpenTelemetry BEFORE importing NestJS
// This ensures all modules are instrumented
import { initializeOpenTelemetry } from './observability/opentelemetry';

// Initialize OpenTelemetry
if (process.env.OTEL_ENABLED !== 'false') {
  initializeOpenTelemetry().catch((err) => {
    console.error('Failed to initialize OpenTelemetry:', err);
  });
}

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/rate-limiting/rate-limit.guard';
import { globalValidationPipe } from './common/validation/global-validation';

async function bootstrap() {
  // rawBody keeps the exact request bytes for webhook signature checks
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  // Governance scans accept up to 512KB of pasted code; Nest's default limit is 100KB
  app.useBodyParser('json', { limit: '1mb' });
  
  // Unknown body and query properties are refused (common/validation/global-validation.ts)
  app.useGlobalPipes(globalValidationPipe());
  
  // Main app on 5174, VitePress on 5175 by default
  const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5174,http://localhost:5175')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({ origin: corsOrigins, credentials: true });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`Backend server running on http://localhost:${port}`);
}
bootstrap().catch((error) => {
  console.error('Backend failed to start:', error);
  process.exit(1);
});


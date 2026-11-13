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
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/rate-limiting/rate-limit.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe());
  
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


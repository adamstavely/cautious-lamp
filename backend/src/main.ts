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
  
  // Apply rate limiting globally
  app.useGlobalGuards(app.get(CustomThrottlerGuard));
  
  app.enableCors({
    origin: ['http://localhost:5174', 'http://localhost:5175'], // Main app on 5174, VitePress on 5175
    credentials: true,
  });

  await app.listen(3000);
  console.log('Backend server running on http://localhost:3000');
}
bootstrap();


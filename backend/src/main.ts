import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow both common Vite ports
    credentials: true,
  });

  await app.listen(3000);
  console.log('Backend server running on http://localhost:3000');
}
bootstrap();


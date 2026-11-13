import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/principal';

@Controller()
export class HealthController {
  @Public()
  @Get('/health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
  
  @Get()
  root() {
    return {
      status: 'ok',
      message: 'Design System API',
      timestamp: new Date().toISOString(),
    };
  }
}


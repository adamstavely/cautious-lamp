import { Controller, Get, Query } from '@nestjs/common';
import { RequirePermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { IntegrationsService } from './integrations.service';

@Controller('api/v1/integrations')
@RequirePermission(Permission.ADMIN_SYSTEM_HEALTH)
export class IntegrationsController {
  constructor(private readonly integrations: IntegrationsService) {}

  /** `?check=true` also contacts Argos and OpenReplay for each connected project */
  @Get('status')
  status(@Query('check') check?: string) {
    return this.integrations.report(check === 'true');
  }
}

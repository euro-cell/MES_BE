import { Controller, Get } from '@nestjs/common';
import { MenuAccessService } from './menu-access.service';

@Controller('permission')
export class MenuAccessController {
  constructor(private readonly service: MenuAccessService) {}

  @Get('user')
  async getAllUserPermissions() {
    return this.service.getAllUserPermissions();
  }
}
